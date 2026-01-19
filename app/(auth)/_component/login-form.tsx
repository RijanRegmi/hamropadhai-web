"use client";

import Link from "next/link";
import AuthLayout from "./AuthLayout";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // optional: save token
      localStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err) {
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Sign up"
    >
      <input
        className="auth-input"
        placeholder="Email or Phone Number"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="auth-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="auth-btn" onClick={submit} disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="auth-row">
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <span>Forgot Password</span>
      </div>
    </AuthLayout>
  );
}
