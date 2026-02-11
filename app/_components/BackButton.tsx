"use client";

import { useRouter } from "next/navigation";
import "./back-button.css";

interface BackButtonProps {
  backUrl?: string;
  onBackClick?: () => void;
  className?: string;
}

export default function BackButton({
  backUrl = "/dashboard",
  onBackClick,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push(backUrl);
    }
  };

  return (
    <button className={`back-btn ${className}`} onClick={handleBackClick}>
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M15 19l-7-7 7-7" />
      </svg>
      <span className="back-btn-text">Back</span>
    </button>
  );
}
