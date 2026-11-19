import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import type { Db } from "../db/client";
import { hashPassword, verifyPassword } from "./passwords";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
export const SESSION_TTL = { short: DAY, remembered: 30 * DAY };

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isSeller: boolean;
  passwordHash: string;
  verified: boolean;
}

/** What the API returns for a user; never includes the password hash. */
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_seller: boolean;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  additional_phone?: string;
  state?: string;
  city: string;
  address: string;
  additional_information?: string;
  is_default: boolean;
}
export type AddressInput = Omit<Address, "id" | "is_default"> & { is_default?: boolean };

export type RegisterResult =
  | { ok: true; user: User; code: string }
  | { ok: false; reason: "username-taken" | "email-taken" };

export type VerifyResult =
  | { ok: true; user: User }
  | { ok: false; reason: "invalid" | "expired" | "too-many-attempts" };

interface UserRow {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_seller: boolean;
  password_hash: string;
  verified: boolean;
}

const USER_COLUMNS = "u.id, u.username, u.email, u.first_name, u.last_name, u.is_seller, u.password_hash, u.verified";
const ADDRESS_FIELDS = [
  "first_name",
  "last_name",
  "phone",
  "additional_phone",
  "state",
  "city",
  "address",
  "additional_information",
  "is_default",
] as const;
const ADDRESS_COLUMNS = `id, ${ADDRESS_FIELDS.join(", ")}`;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const normaliseEmail = (email: string) => email.trim().toLowerCase();

const fromUserRow = (r: UserRow): User => ({
  id: r.id,
  username: r.username,
  email: r.email,
  firstName: r.first_name,
  lastName: r.last_name,
  isSeller: r.is_seller,
  passwordHash: r.password_hash,
  verified: r.verified,
});

// Optional address fields come back as null; the API omits them instead.
const fromAddressRow = (r: Record<string, unknown>): Address =>
  Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null)) as unknown as Address;

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    is_seller: u.isSeller,
  };
}

/** Users, sessions, email verification codes and saved addresses, stored in Postgres. */
export class AccountStore {
  constructor(private readonly db: Db) {}

  // ---- registration & verification ------------------------------------------------------

  async register(input: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isSeller: boolean;
  }): Promise<RegisterResult> {
    const email = normaliseEmail(input.email);
    const username = input.username.trim();
    const passwordHash = await hashPassword(input.password);

    return this.db.transaction(async (tx) => {
      const clashes = await tx.query<{ id: string; username: string; email: string; verified: boolean }>(
        "SELECT id, username, email, verified FROM users WHERE lower(username) = lower($1) OR email = $2",
        [username, email],
      );
      for (const c of clashes) {
        if (!c.verified) continue;
        return {
          ok: false as const,
          reason:
            c.username.toLowerCase() === username.toLowerCase()
              ? ("username-taken" as const)
              : ("email-taken" as const),
        };
      }
      // Unverified accounts don't hold on to a username/email: re-registering replaces them.
      for (const c of clashes) await tx.query("DELETE FROM users WHERE id = $1", [c.id]);

      const user: User = {
        id: randomUUID(),
        username,
        email,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        isSeller: input.isSeller,
        passwordHash,
        verified: false,
      };
      await tx.query(
        `INSERT INTO users (id, username, email, first_name, last_name, is_seller, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, user.username, user.email, user.firstName, user.lastName, user.isSeller, user.passwordHash],
      );
      return { ok: true as const, user, code: await issueOtp(tx, user.id) };
    });
  }

  /** New code for an unverified account; null if unknown, already verified, or asked too soon. */
  async resendOtp(email: string): Promise<{ user: User; code: string } | null> {
    const user = await this.findByEmail(normaliseEmail(email));
    if (!user || user.verified) return null;
    const [pending] = await this.db.query<{ sent_at: Date | string }>(
      "SELECT sent_at FROM otps WHERE user_id = $1",
      [user.id],
    );
    if (pending && Date.now() - new Date(pending.sent_at).getTime() < OTP_RESEND_COOLDOWN_MS) return null;
    return { user, code: await issueOtp(this.db, user.id) };
  }

  async verifyOtp(email: string, code: string): Promise<VerifyResult> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.query<UserRow & { code_hash: string; expires_at: Date | string; attempts: number }>(
        `SELECT ${USER_COLUMNS}, o.code_hash, o.expires_at, o.attempts
         FROM users u JOIN otps o ON o.user_id = u.id
         WHERE u.email = $1 FOR UPDATE`,
        [normaliseEmail(email)],
      );
      if (!row) return { ok: false as const, reason: "invalid" as const };

      if (new Date(row.expires_at).getTime() <= Date.now()) {
        await tx.query("DELETE FROM otps WHERE user_id = $1", [row.id]);
        return { ok: false as const, reason: "expired" as const };
      }
      if (row.code_hash !== sha256(code.trim())) {
        if (row.attempts + 1 >= OTP_MAX_ATTEMPTS) {
          await tx.query("DELETE FROM otps WHERE user_id = $1", [row.id]);
          return { ok: false as const, reason: "too-many-attempts" as const };
        }
        await tx.query("UPDATE otps SET attempts = attempts + 1 WHERE user_id = $1", [row.id]);
        return { ok: false as const, reason: "invalid" as const };
      }

      await tx.query("DELETE FROM otps WHERE user_id = $1", [row.id]);
      await tx.query("UPDATE users SET verified = true WHERE id = $1", [row.id]);
      return { ok: true as const, user: { ...fromUserRow(row), verified: true } };
    });
  }

  // ---- login & sessions -------------------------------------------------------------------

  /** Accepts a username or an email address. */
  async checkCredentials(login: string, password: string) {
    const user = login.includes("@")
      ? await this.findByEmail(normaliseEmail(login))
      : await this.findByUsername(login.trim());
    // Always run the hash so response time doesn't reveal whether the account exists.
    const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
    return ok && user ? user : null;
  }

  async createSession(userId: string, ttlMs: number) {
    const token = randomBytes(32).toString("base64url");
    await this.db.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
      sha256(token),
      userId,
      new Date(Date.now() + ttlMs).toISOString(),
    ]);
    // Opportunistic cleanup keeps the table small without a cron job.
    await this.db.query("DELETE FROM sessions WHERE expires_at < now()");
    return token;
  }

  async userForSession(token: string | undefined): Promise<User | null> {
    if (!token) return null;
    const [row] = await this.db.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > now() AND u.verified`,
      [sha256(token)],
    );
    return row ? fromUserRow(row) : null;
  }

  async endSession(token: string) {
    await this.db.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
  }

  // ---- addresses ----------------------------------------------------------------------------

  async listAddresses(userId: string) {
    const rows = await this.db.query(
      `SELECT ${ADDRESS_COLUMNS} FROM addresses WHERE user_id = $1 ORDER BY created_at`,
      [userId],
    );
    return rows.map(fromAddressRow);
  }

  async addAddress(userId: string, input: AddressInput): Promise<Address> {
    return this.db.transaction(async (tx) => {
      const [{ count }] = await tx.query<{ count: string | number }>(
        "SELECT count(*) AS count FROM addresses WHERE user_id = $1",
        [userId],
      );
      const isDefault = input.is_default ?? Number(count) === 0; // first address is the default
      if (isDefault) await tx.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
      const [row] = await tx.query(
        `INSERT INTO addresses (id, user_id, ${ADDRESS_FIELDS.join(", ")})
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING ${ADDRESS_COLUMNS}`,
        [
          randomUUID(),
          userId,
          input.first_name,
          input.last_name,
          input.phone,
          input.additional_phone ?? null,
          input.state ?? null,
          input.city,
          input.address,
          input.additional_information ?? null,
          isDefault,
        ],
      );
      return fromAddressRow(row);
    });
  }

  async updateAddress(userId: string, id: string, changes: Partial<AddressInput>): Promise<Address | null> {
    const fields = ADDRESS_FIELDS.filter((f) => changes[f] !== undefined);
    return this.db.transaction(async (tx) => {
      if (changes.is_default) {
        await tx.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
      }
      // Column names come from the fixed ADDRESS_FIELDS list, never from the request.
      const sets = fields.map((f, i) => `${f} = $${i + 3}`);
      const [row] = await tx.query(
        `UPDATE addresses SET ${sets.length ? sets.join(", ") : "id = id"}
         WHERE id = $1 AND user_id = $2 RETURNING ${ADDRESS_COLUMNS}`,
        [id, userId, ...fields.map((f) => changes[f])],
      );
      return row ? fromAddressRow(row) : null;
    });
  }

  async removeAddress(userId: string, id: string) {
    const rows = await this.db.query("DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id", [
      id,
      userId,
    ]);
    return rows.length > 0;
  }

  // ---- internals ------------------------------------------------------------------------------

  private async findByEmail(email: string) {
    const [row] = await this.db.query<UserRow>(`SELECT ${USER_COLUMNS} FROM users u WHERE u.email = $1`, [email]);
    return row ? fromUserRow(row) : null;
  }

  private async findByUsername(username: string) {
    const [row] = await this.db.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users u WHERE lower(u.username) = lower($1)`,
      [username],
    );
    return row ? fromUserRow(row) : null;
  }
}

async function issueOtp(db: Db, userId: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.query(
    `INSERT INTO otps (user_id, code_hash, expires_at, attempts, sent_at) VALUES ($1, $2, $3, 0, now())
     ON CONFLICT (user_id) DO UPDATE
       SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, sent_at = now()`,
    [userId, sha256(code), new Date(Date.now() + OTP_TTL_MS).toISOString()],
  );
  return code;
}

// A valid hash of a random password, so failed lookups cost the same as real checks.
let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= hashPassword(randomBytes(16).toString("hex")));
