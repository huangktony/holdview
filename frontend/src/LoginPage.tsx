// src/LoginPage.tsx
import { useState } from "react";
import { apiFetch } from "./api";

export function LoginPage({
  onLogin,
  onShowRegister,
}: {
  onLogin: (token: string) => void;
  onShowRegister: () => void;
}) {
  // email, password, error state — three useStates
  const[email, updateEmail] = useState("")
  const[password, updatePassword] = useState("")
  const[errorState, setError] = useState("")

  async function handleSubmit() {
    try{
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({email, password}),
        });
        onLogin(data.access_token);
    } catch{
        setError("Invalid email or password")
    }

  }

  return (
  <div>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => updateEmail(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => updatePassword(e.target.value)}
    />
    <button onClick={handleSubmit}>Log in</button>
    {errorState && <p>{errorState}</p>}
    <p>
      <button onClick={onShowRegister}>Create an account</button>
    </p>
  </div>
);
}