"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "./../../../assets/images/logo1.png";
import bg from "./../../../assets/images/loginbg.jpg";

interface Props {
  title: string;
  children: React.ReactNode;
  switchText: string;
  switchLink: string;
  switchLabel: string;
  reverse?: boolean;
}

export default function AuthLayout({
  title,
  children,
  switchText,
  switchLink,
  switchLabel,
  reverse = false,
}: Props) {
  return (
    <div
      className="auth-wrapper"
      style={{
        backgroundImage: `url(${bg.src})`,
      }}
    >
      <div className="auth-overlay" />

      <div className={`auth-card ${reverse ? "reverse" : ""}`}>
        <div className="auth-form">
          <h2 className="auth-title">{title}</h2>
          {children}
        </div>

        <div className="auth-purple">
          <Image
            src={Logo}
            alt="Logo"
            width={120}
            height={120}
            className="auth-logo"
          />
          <h3 className="heading">Welcome To HamroPadhai</h3>
          <p className="paragraph">{switchText}</p>

          <Link href={switchLink} className="auth-switch-btn">
            {switchLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
