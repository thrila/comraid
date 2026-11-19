import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app";
import { connectPglite } from "../src/db/client";
import type { Mailer } from "../src/accounts/mailer";

async function setup() {
  const codes = new Map<string, string>();
  const mailer: Mailer = { sendOtp: async (to, code) => void codes.set(to, code) };
  const app = await createApp({ db: await connectPglite(), seed: false, mailer });

  const call = async (method: string, path: string, body?: unknown, cookie?: string) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (cookie) headers.Cookie = cookie;
    const res = await app.handle(
      new Request(`http://localhost${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
    const setCookie = res.headers.get("set-cookie") ?? "";
    return { res, json: await res.json().catch(() => null), sid: setCookie.match(/sid=([^;]*)/)?.[1] };
  };
  return { call, codes };
}

const shopper = {
  username: "ada",
  first_name: "Ada",
  last_name: "Obi",
  email: "Ada@Example.com",
  password: "correct horse battery",
};

async function signUpAndVerify(ctx: Awaited<ReturnType<typeof setup>>) {
  assert.equal((await ctx.call("POST", "/auth/register", shopper)).res.status, 201);
  const code = ctx.codes.get("ada@example.com")!;
  const verified = await ctx.call("POST", "/auth/verify-otp", { email: shopper.email, otp: code });
  assert.equal(verified.res.status, 200);
  return `sid=${verified.sid}`;
}

test("register -> verify -> session", async () => {
  const ctx = await setup();
  const cookie = await signUpAndVerify(ctx);
  const me = await ctx.call("GET", "/auth/me", undefined, cookie);
  assert.equal(me.json.username, "ada");
  assert.equal(me.json.email, "ada@example.com");
  assert.equal(me.json.passwordHash, undefined);
});

test("cannot log in before verifying the email", async () => {
  const ctx = await setup();
  await ctx.call("POST", "/auth/register", shopper);
  const login = await ctx.call("POST", "/auth/login", { username: "ada", password: shopper.password });
  assert.equal(login.res.status, 403);
});

test("wrong OTPs are limited", async () => {
  const ctx = await setup();
  await ctx.call("POST", "/auth/register", shopper);
  const real = ctx.codes.get("ada@example.com")!;
  const wrong = real === "000000" ? "111111" : "000000";
  for (let i = 0; i < 4; i++) {
    assert.equal((await ctx.call("POST", "/auth/verify-otp", { email: shopper.email, otp: wrong })).res.status, 400);
  }
  const fifth = await ctx.call("POST", "/auth/verify-otp", { email: shopper.email, otp: wrong });
  assert.match(fifth.json.error, /Too many/);
  // The code is burned after too many attempts, even the right one.
  assert.equal((await ctx.call("POST", "/auth/verify-otp", { email: shopper.email, otp: real })).res.status, 400);
});

test("login with username or email, logout ends the session", async () => {
  const ctx = await setup();
  await signUpAndVerify(ctx);

  assert.equal((await ctx.call("POST", "/auth/login", { username: "ada", password: "nope-nope" })).res.status, 401);
  const byEmail = await ctx.call("POST", "/auth/login", { username: "ADA@example.com", password: shopper.password });
  assert.equal(byEmail.res.status, 200);

  const cookie = `sid=${byEmail.sid}`;
  await ctx.call("POST", "/auth/logout", undefined, cookie);
  assert.equal((await ctx.call("GET", "/auth/me", undefined, cookie)).res.status, 401);
});

test("verified usernames and emails cannot be taken again", async () => {
  const ctx = await setup();
  await signUpAndVerify(ctx);
  const again = await ctx.call("POST", "/auth/register", { ...shopper, email: "other@example.com" });
  assert.equal(again.res.status, 409);
});

test("addresses are private to their owner", async () => {
  const ctx = await setup();
  const cookie = await signUpAndVerify(ctx);
  const address = {
    first_name: "Ada",
    last_name: "Obi",
    phone: "+2348000000000",
    city: "Yenagoa",
    address: "No. 4, Road Line Street",
  };

  assert.equal((await ctx.call("GET", "/addresses")).res.status, 401);

  const created = await ctx.call("POST", "/addresses", address, cookie);
  assert.equal(created.res.status, 201);
  assert.equal(created.json.is_default, true); // first address becomes the default

  const second = await ctx.call("POST", "/addresses", { ...address, city: "Lagos", is_default: true }, cookie);
  const list = (await ctx.call("GET", "/addresses", undefined, cookie)).json;
  assert.equal(list.length, 2);
  assert.deepEqual(
    list.filter((a: { is_default: boolean }) => a.is_default).map((a: { id: string }) => a.id),
    [second.json.id],
  );

  const patched = await ctx.call("PATCH", `/addresses/${created.json.id}`, { city: "Port Harcourt" }, cookie);
  assert.equal(patched.json.city, "Port Harcourt");
  assert.equal((await ctx.call("DELETE", `/addresses/${created.json.id}`, undefined, cookie)).res.status, 200);
  assert.equal((await ctx.call("DELETE", `/addresses/${created.json.id}`, undefined, cookie)).res.status, 404);
});
