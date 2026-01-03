"use client";
import Link from "next/link";
import AuthLayout from "./AuthLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { startTransition, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData } from "../schema";

export default function LoginForm() {
  return (
    <AuthLayout
      title="Sign in"
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Sign up"
    >
      <input className="auth-input" placeholder="Email or Phone Number" />
      <input type="password" className="auth-input" placeholder="Password" />

      <Link rel="stylesheet" href="/dashboard">
        <button className="auth-btn">Sign in</button>
      </Link>

      <div className="auth-row">
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <span>Forgot Password</span>
      </div>
    </AuthLayout>
  );
}
