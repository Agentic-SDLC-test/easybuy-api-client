const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createClient } = require("../dist/index.js");

function headerValue(init, name) {
  return new Headers(init && init.headers).get(name);
}

function installFetch(impl) {
  const original = global.fetch;
  global.fetch = impl;
  return () => {
    global.fetch = original;
  };
}

test("login posts JSON and sends the auth token", async () => {
  let seen;
  const restore = installFetch(async (url, init) => {
    seen = { url, init };
    return { json: async () => ({ success: true, data: { token: "t" } }) };
  });
  const client = createClient({
    baseUrl: "http://example.test/",
    getToken: async () => "jwt-1",
    onUnauthorized: () => {
      throw new Error("should not logout");
    },
  });
  const result = await client.login("a@b.co", "secret");
  restore();
  assert.equal(result.success, true);
  assert.equal(seen.url, "http://example.test/login");
  assert.equal(seen.init.method, "POST");
  assert.equal(headerValue(seen.init, "content-type"), "application/json");
  assert.equal(headerValue(seen.init, "x-auth-token"), "jwt-1");
  assert.equal(seen.init.body, JSON.stringify({ email: "a@b.co", password: "secret" }));
  assert.equal(client.imageUrl("a.png"), "http://example.test/uploads/a.png");
});

test("a null token omits x-auth-token", async () => {
  let seen;
  const restore = installFetch(async (url, init) => {
    seen = init;
    return { json: async () => ({ success: true }) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await client.login("a@b.co", "secret");
  restore();
  assert.equal(headerValue(seen, "x-auth-token"), null);
});

test("getProducts without a search term has no query", async () => {
  let seenUrl;
  const restore = installFetch(async (url) => {
    seenUrl = url;
    return { json: async () => ({ success: true, data: [] }) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await client.getProducts("");
  restore();
  assert.equal(seenUrl, "http://example.test/products");
});

test("getProducts with a search term keeps the encoded query", async () => {
  let seenUrl;
  const restore = installFetch(async (url) => {
    seenUrl = url;
    return { json: async () => ({}) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await client.getProducts("a b");
  restore();
  assert.equal(seenUrl, "http://example.test/products?search=a%20b");
});

test("uploadPhoto does not set Content-Type", async () => {
  let seen;
  const restore = installFetch(async (url, init) => {
    seen = init;
    return { json: async () => ({ image: "a.png" }) };
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => "jwt-1",
    onUnauthorized: () => {},
  });
  const body = new FormData();
  body.append("photos", "file");
  await client.uploadPhoto(body);
  restore();
  assert.equal(headerValue(seen, "content-type"), null);
  assert.equal(seen.body, body);
});

test("HTTP 401 JSON is returned and does not logout", async () => {
  let loggedOut = false;
  const restore = installFetch(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ success: false, message: "Invalid email or password" }),
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {
      loggedOut = true;
    },
  });
  const result = await client.login("a@b.co", "nope");
  restore();
  assert.equal(loggedOut, false);
  assert.equal(result.success, false);
  assert.equal(result.message, "Invalid email or password");
});

test("jwt expired calls onUnauthorized and still returns the body", async () => {
  let loggedOut = false;
  const restore = installFetch(async () => ({
    status: 401,
    json: async () => ({ err: "jwt expired" }),
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => "old",
    onUnauthorized: async () => {
      loggedOut = true;
    },
  });
  const result = await client.getOrders();
  restore();
  assert.equal(loggedOut, true);
  assert.equal(result.err, "jwt expired");
});

test("other err values do not logout", async () => {
  let loggedOut = false;
  const restore = installFetch(async () => ({
    json: async () => ({ err: "Authentication failed" }),
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => "old",
    onUnauthorized: () => {
      loggedOut = true;
    },
  });
  const result = await client.getOrders();
  restore();
  assert.equal(loggedOut, false);
  assert.equal(result.err, "Authentication failed");
});

test("a non-JSON body becomes an empty object", async () => {
  const restore = installFetch(async () => ({
    json: async () => {
      throw new Error("not json");
    },
  }));
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  const result = await client.getCategories();
  restore();
  assert.deepEqual(result, {});
});

test("a rejected fetch rejects the call", async () => {
  const restore = installFetch(async () => {
    throw new Error("network down");
  });
  const client = createClient({
    baseUrl: "http://example.test",
    getToken: async () => null,
    onUnauthorized: () => {},
  });
  await assert.rejects(() => client.getProducts(), /network down/);
  restore();
});
