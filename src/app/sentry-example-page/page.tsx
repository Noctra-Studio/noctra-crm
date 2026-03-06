"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        maxWidth: 600,
        margin: "auto",
      }}>
      <h1>Sentry Test Page</h1>
      <p>
        This page is used to verify that Sentry is properly configured and
        capturing errors.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "2rem",
        }}>
        <button
          type="button"
          style={{
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => {
            throw new Error("Sentry Frontend Error — Intentional Test");
          }}>
          Throw Client-Side Error
        </button>

        <button
          type="button"
          style={{
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={async () => {
            await fetch("/api/sentry-example-api");
          }}>
          Throw Server-Side Error (via API)
        </button>

        <button
          type="button"
          style={{
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => {
            Sentry.captureException(
              new Error("Sentry Manual Capture — Intentional Test"),
            );
            alert("Error captured and sent to Sentry.");
          }}>
          Capture Exception Manually
        </button>
      </div>
      <p style={{ marginTop: "2rem", color: "#888", fontSize: "0.85rem" }}>
        ⚠️ This page is for internal debugging only. Do not link it publicly.
      </p>
    </main>
  );
}
