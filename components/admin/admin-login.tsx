"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function pemBytes(pem: string): ArrayBuffer {
  const encoded = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const decoded = atob(encoded);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
    .buffer;
}

function base64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function AdminLogin({ keyIds }: { keyIds: string[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const form = new FormData(event.currentTarget);
      const keyId = String(form.get("keyId"));
      const file = form.get("privateKey");
      if (!(file instanceof File) || !file.size)
        throw new Error("Choose a private key file.");

      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        pemBytes(await file.text()),
        { name: "Ed25519" },
        false,
        ["sign"],
      );
      const challengeResponse = await fetch("/api/admin-auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      if (!challengeResponse.ok) throw new Error("Could not start login.");

      const challenge = (await challengeResponse.json()) as {
        id: string;
        keyId: string;
        message: string;
      };
      const signature = await crypto.subtle.sign(
        "Ed25519",
        privateKey,
        new TextEncoder().encode(challenge.message),
      );
      const response = await fetch("/api/admin-auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...challenge, signature: base64Url(signature) }),
      });
      if (!response.ok) throw new Error("Private key did not match.");

      router.push("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login failed.");
      setPending(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={login}>
      <label htmlFor="keyId">Public key</label>
      <select id="keyId" name="keyId">
        {keyIds.map((keyId) => (
          <option key={keyId} value={keyId}>
            {keyId}
          </option>
        ))}
      </select>
      <label htmlFor="privateKey">Matching private key</label>
      <input
        id="privateKey"
        name="privateKey"
        type="file"
        accept=".pem,.pk8"
        required
      />
      <p className="admin-form-note">
        Key stays in this browser tab and is never uploaded.
      </p>
      {error && (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      )}
      <button className="admin-button" disabled={pending} type="submit">
        {pending ? "VERIFYING…" : "ENTER ADMIN"}
      </button>
    </form>
  );
}
