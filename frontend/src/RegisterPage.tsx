// src/RegisterPage.tsx
import { useState } from "react";
import { apiFetch } from "./api";

export function RegisterPage({
  onRegistered,
  onBackToLogin,
}: {
  onRegistered: (token: string) => void;
  onBackToLogin: () => void;
}) {
  const [email, updateEmail] = useState("");
  const [password, updatePassword] = useState("");
  const [errorState, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onRegistered(data.access_token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Create account</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => updateEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (min. 8 characters)"
        value={password}
        onChange={(e) => updatePassword(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Creating account..." : "Create account"}
      </button>
      {errorState && <p>{errorState}</p>}
      <p>
        <button onClick={onBackToLogin}>Back to log in</button>
      </p>
    </div>
  );
}
