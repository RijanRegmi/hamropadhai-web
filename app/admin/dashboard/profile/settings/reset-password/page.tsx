"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HamroPadhai from "./../../../../../../assets/images/HamroPadhai.png";
import {
  getMyEmailAction,
  sendResetCodeAction,
} from "./../../../../../../lib/actions/reset-password-authenticated-action";
import "./reset-password-authenticated.css";

export default function SendResetCodePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadAndSend();
  }, []);

  const loadAndSend = async () => {
    setStatus("loading");
    setError("");
    setEmail("");

    // Step 1 — fetch logged-in user's email
    const profileResult = await getMyEmailAction();
    if (!profileResult.success || !profileResult.email) {
      setError(profileResult.message || "Could not find your email address.");
      setStatus("error");
      return;
    }

    const userEmail = profileResult.email;
    setEmail(userEmail);

    // Step 2 — send reset code to that email
    const sendResult = await sendResetCodeAction(userEmail);
    if (!sendResult.success) {
      setError(sendResult.message || "Failed to send verification code.");
      setStatus("error");
      return;
    }

    // ✅ Step 3 — window.location.href instead of router.replace (fixes stuck loading)
    window.location.href = `/admin/dashboard/profile/settings/reset-password/verify?email=${encodeURIComponent(userEmail)}`;
  };

  return (
    <div className="rpa-page">
      <header className="rpa-header">
        <div className="rpa-header-inner">
          <button
            type="button"
            className="rpa-back-btn"
            onClick={() => router.push("/admin/dashboard/profile/settings")}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="rpa-back-text">Back</span>
          </button>
          <div className="rpa-brand">
            <Image src={HamroPadhai} alt="HamroPadhai" height={32} />
          </div>
        </div>
      </header>

      <main className="rpa-body">
        <div className="rpa-card">
          {status === "loading" ? (
            <>
              <div className="rpa-icon-wrap rpa-icon-purple">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="rpa-title">Sending reset code</h1>
              <p className="rpa-subtitle">
                {email ? (
                  <>
                    A 6-digit code is being sent to
                    <br />
                    <strong className="rpa-email">{email}</strong>
                  </>
                ) : (
                  "Fetching your account details..."
                )}
              </p>
              <div className="rpa-spinner-wrap">
                <span className="rpa-spinner" />
              </div>
            </>
          ) : (
            <>
              <div className="rpa-icon-wrap rpa-icon-red">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="rpa-title">Something went wrong</h1>
              <p className="rpa-subtitle rpa-error-text">{error}</p>
              <button
                type="button"
                className="rpa-retry-btn"
                onClick={loadAndSend}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
