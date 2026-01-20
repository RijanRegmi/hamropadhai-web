"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "./../../../assets/images/logo1.png";
import books from "./../../../assets/images/books.png";
import bg from "./../../../assets/images/loginbg.jpg";
import logo1 from "./../../../assets/images/logo.png";

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
          {/* Logo ONLY for mobile/tablet - hidden on desktop */}
          <div className="auth-mobile-logo">
            <Image src={logo1} alt="Logo" width={90} height={90} />
          </div>

          <h2 className="auth-title">{title}</h2>
          {children}

          {/* Mobile switch link */}
          <div className="auth-mobile-switch">
            {switchText} <Link href={switchLink}>{switchLabel}</Link>
          </div>
        </div>

        {/* Desktop purple panel */}
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
