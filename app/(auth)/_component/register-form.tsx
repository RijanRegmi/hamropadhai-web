"use client";

import AuthLayout from "./AuthLayout";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState(""); // ✅ FIXED
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // ✅ frontend validation
    if (!gender) {
      alert("Please select your gender");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5050/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        console.error(data.errors);
        return;
      }

      alert("Account created successfully");
      router.push("/login");
    } catch (err) {
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign up"
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
      reverse
    >
      <input
        className="auth-input"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        className="auth-input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="auth-input"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        className="auth-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        className="auth-input"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* ✅ UI NOT CHANGED */}
      <div className="gender-group">
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            onChange={() => setGender("male")}
          />{" "}
          Male
        </label>

        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            onChange={() => setGender("female")}
          />{" "}
          Female
        </label>
      </div>

      <button className="auth-btn" onClick={submit} disabled={loading}>
        {loading ? "Signing up..." : "Sign up"}
      </button>
    </AuthLayout>
  );
}
