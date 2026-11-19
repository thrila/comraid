import { Elysia, t } from "elysia";
import type { Mailer } from "../accounts/mailer";
import { RateLimiter } from "../accounts/rate-limit";
import { SESSION_TTL, toPublicUser, type AccountStore } from "../accounts/store";

export const SESSION_COOKIE = "sid";

const loginLimiter = () => new RateLimiter(10, 15 * 60 * 1000);
const registerLimiter = () => new RateLimiter(10, 60 * 60 * 1000);

const addressFields = {
  first_name: t.String({ minLength: 1, maxLength: 100 }),
  last_name: t.String({ minLength: 1, maxLength: 100 }),
  phone: t.String({ minLength: 3, maxLength: 30 }),
  additional_phone: t.Optional(t.String({ maxLength: 30 })),
  state: t.Optional(t.String({ maxLength: 100 })),
  city: t.String({ minLength: 1, maxLength: 100 }),
  address: t.String({ minLength: 1, maxLength: 300 }),
  additional_information: t.Optional(t.String({ maxLength: 500 })),
  is_default: t.Optional(t.Boolean()),
};

export interface AccountRoutesOptions {
  accounts: AccountStore;
  mailer: Mailer;
  /** Mark the session cookie Secure (set when the API is served over https). */
  secureCookies: boolean;
}

/** Registration with email OTP, cookie sessions, and the signed-in shopper's addresses. */
export function accountRoutes({ accounts, mailer, secureCookies }: AccountRoutesOptions) {
  const logins = loginLimiter();
  const registrations = registerLimiter();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookies,
    path: "/",
  };

  const NOT_SIGNED_IN = { error: "Not signed in" };
  const signedIn = (cookie: Record<string, { value?: unknown }>) => {
    const token = cookie[SESSION_COOKIE]?.value;
    return accounts.userForSession(typeof token === "string" ? token : undefined);
  };

  const clientKey = (request: Request, headers: Record<string, string | undefined>) =>
    headers["cf-connecting-ip"] ??
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
    headers["x-real-ip"] ??
    new URL(request.url).hostname;

  return (
    new Elysia({ name: "accounts" })
      .group("/auth", (app) =>
        app
          .post(
            "/register",
            async ({ body, request, headers, status }) => {
              if (!registrations.attempt(clientKey(request, headers))) {
                return status(429, { error: "Too many sign-ups from this address. Try again later." });
              }
              const result = await accounts.register({
                username: body.username,
                email: body.email,
                password: body.password,
                firstName: body.first_name,
                lastName: body.last_name,
                isSeller: body.is_seller ?? false,
              });
              if (!result.ok) {
                return status(409, {
                  error:
                    result.reason === "username-taken"
                      ? "That username is already taken"
                      : "An account with that email already exists",
                });
              }
              await mailer.sendOtp(result.user.email, result.code);
              return status(201, {
                email: result.user.email,
                message: "We sent a 6-digit code to your email",
              });
            },
            {
              body: t.Object({
                username: t.String({ minLength: 3, maxLength: 30, pattern: "^[A-Za-z0-9_.-]+$" }),
                first_name: t.String({ minLength: 1, maxLength: 100 }),
                last_name: t.String({ minLength: 1, maxLength: 100 }),
                email: t.String({ format: "email", maxLength: 254 }),
                password: t.String({ minLength: 8, maxLength: 200 }),
                is_seller: t.Optional(t.Boolean()),
              }),
            },
          )
          .post(
            "/resend-otp",
            async ({ body }) => {
              const issued = await accounts.resendOtp(body.email);
              if (issued) await mailer.sendOtp(issued.user.email, issued.code);
              // Same answer either way, so this can't be used to probe which emails exist.
              return { message: "If that account is waiting for verification, a new code is on its way" };
            },
            { body: t.Object({ email: t.String({ format: "email", maxLength: 254 }) }) },
          )
          .post(
            "/verify-otp",
            async ({ body, cookie, status }) => {
              const result = await accounts.verifyOtp(body.email, body.otp);
              if (!result.ok) {
                const messages = {
                  invalid: "That code is not right",
                  expired: "That code has expired. Request a new one",
                  "too-many-attempts": "Too many wrong codes. Request a new one",
                };
                return status(400, { error: messages[result.reason] });
              }
              const token = await accounts.createSession(result.user.id, SESSION_TTL.short);
              cookie[SESSION_COOKIE].set({ value: token, ...cookieOptions });
              return toPublicUser(result.user);
            },
            {
              body: t.Object({
                email: t.String({ format: "email", maxLength: 254 }),
                otp: t.String({ pattern: "^[0-9]{6}$" }),
              }),
            },
          )
          .post(
            "/login",
            async ({ body, cookie, status }) => {
              // Keyed on the account, not the IP: forwarded-for headers are easy to spoof.
              const key = body.username.trim().toLowerCase();
              if (!logins.attempt(key)) {
                return status(429, { error: "Too many attempts. Try again in a few minutes." });
              }
              const user = await accounts.checkCredentials(body.username, body.password);
              if (!user) return status(401, { error: "Wrong username or password" });
              if (!user.verified) {
                return status(403, { error: "Verify your email before logging in", email: user.email });
              }
              logins.reset(key);

              const ttl = body.remember ? SESSION_TTL.remembered : SESSION_TTL.short;
              const token = await accounts.createSession(user.id, ttl);
              cookie[SESSION_COOKIE].set({
                value: token,
                ...cookieOptions,
                // Without "remember me" the cookie ends with the browser session.
                ...(body.remember ? { maxAge: ttl / 1000 } : {}),
              });
              return toPublicUser(user);
            },
            {
              body: t.Object({
                /** username or email */
                username: t.String({ minLength: 1, maxLength: 254 }),
                password: t.String({ minLength: 1, maxLength: 200 }),
                remember: t.Optional(t.Boolean()),
              }),
            },
          )
          .post("/logout", async ({ cookie }) => {
            const token = cookie[SESSION_COOKIE].value;
            if (typeof token === "string") await accounts.endSession(token);
            cookie[SESSION_COOKIE].remove();
            return { ok: true };
          })
          .get("/me", async ({ cookie, status }) => {
            const user = await signedIn(cookie);
            return user ? toPublicUser(user) : status(401, NOT_SIGNED_IN);
          }),
      )

      // Address book: every handler checks the session itself, so no route can skip it.
      .group("/addresses", (app) =>
        app
          .get("", async ({ cookie, status }) => {
            const user = await signedIn(cookie);
            if (!user) return status(401, NOT_SIGNED_IN);
            return accounts.listAddresses(user.id);
          })
          .post(
            "",
            async ({ cookie, body, status }) => {
              const user = await signedIn(cookie);
              if (!user) return status(401, NOT_SIGNED_IN);
              return status(201, await accounts.addAddress(user.id, body));
            },
            { body: t.Object(addressFields) },
          )
          .patch(
            "/:id",
            async ({ cookie, params, body, status }) => {
              const user = await signedIn(cookie);
              if (!user) return status(401, NOT_SIGNED_IN);
              return (
                (await accounts.updateAddress(user.id, params.id, body)) ??
                status(404, { error: "Address not found" })
              );
            },
            { body: t.Partial(t.Object(addressFields)) },
          )
          .delete("/:id", async ({ cookie, params, status }) => {
            const user = await signedIn(cookie);
            if (!user) return status(401, NOT_SIGNED_IN);
            return (await accounts.removeAddress(user.id, params.id))
              ? { deleted: params.id }
              : status(404, { error: "Address not found" });
          }),
      )
  );
}
