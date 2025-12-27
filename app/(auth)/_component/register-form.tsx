"use client";

import AuthLayout from "./AuthLayout";

export default function RegisterForm() {
  return (
    <AuthLayout
      title="Sign up"
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
      reverse
    >
      <input className="auth-input" placeholder="Full Name" />
      <input className="auth-input" placeholder="Email" />
      <input className="auth-input" placeholder="Phone Number" />
      <input type="password" className="auth-input" placeholder="Password" />
      <input
        type="password"
        className="auth-input"
        placeholder="Confirm Password"
      />

      <div className="gender-group">
        <label>
          <input type="radio" name="gender" /> Male
        </label>
        <label>
          <input type="radio" name="gender" /> Female
        </label>
      </div>

      <button className="auth-btn">Sign up</button>
    </AuthLayout>
  );
}
