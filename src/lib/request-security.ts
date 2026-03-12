import "server-only";

import { randomBytes, timingSafeEqual, createCipheriv, createDecipheriv, createHash } from "crypto";

const CSRF_COOKIE_NAME = "noctra_csrf_secret";
const TOKEN_DELIMITER = ".";

function encodeBase64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64");
}

function getAppSigningKey() {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error("Missing CSRF_SECRET environment variable");
  }

  return createHash("sha256").update(secret).digest();
}

function signCsrfParts(secret: string, nonce: string) {
  return createHash("sha256")
    .update(secret)
    .update(TOKEN_DELIMITER)
    .update(nonce)
    .update(TOKEN_DELIMITER)
    .update(getAppSigningKey())
    .digest();
}

export function getCsrfCookieName() {
  return CSRF_COOKIE_NAME;
}

export function createCsrfSecret() {
  return encodeBase64Url(randomBytes(32));
}

export function issueCsrfToken(secret: string) {
  const nonce = encodeBase64Url(randomBytes(16));
  const signature = encodeBase64Url(signCsrfParts(secret, nonce));
  return `${nonce}${TOKEN_DELIMITER}${signature}`;
}

export function verifyCsrfToken(secret: string, token: string) {
  const [nonce, signature] = token.split(TOKEN_DELIMITER);
  if (!nonce || !signature) {
    return false;
  }

  const expected = signCsrfParts(secret, nonce);
  const received = decodeBase64Url(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function assertSameOrigin(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return origin === url.origin;
  }

  if (referer) {
    try {
      return new URL(referer).origin === url.origin;
    } catch {
      return false;
    }
  }

  return false;
}

function getEncryptionKey() {
  const raw = process.env.APP_ENCRYPTION_KEY;

  if (!raw) {
    throw new Error("Missing APP_ENCRYPTION_KEY environment variable");
  }

  const isHex = /^[a-f0-9]{64}$/i.test(raw);
  const key = isHex ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }

  return key;
}

export function encryptSecret(plaintext: string) {
  if (!plaintext) {
    return plaintext;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:v1:${encodeBase64Url(iv)}:${encodeBase64Url(tag)}:${encodeBase64Url(encrypted)}`;
}

export function decryptSecret(ciphertext: string) {
  if (!ciphertext.startsWith("enc:v1:")) {
    return ciphertext;
  }

  const [, , ivPart, tagPart, dataPart] = ciphertext.split(":");
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("Invalid encrypted secret format");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    decodeBase64Url(ivPart),
  );
  decipher.setAuthTag(decodeBase64Url(tagPart));

  const decrypted = Buffer.concat([
    decipher.update(decodeBase64Url(dataPart)),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
