"use client";

import Image from "next/image";

import HamroPadhai from "./../../assets/images/HamroPadhai.png";

import "./page-header.css";

export default function PageHeader() {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        <div className="page-header-brand">
          <Image
            src={HamroPadhai}
            alt="HamroPadhai Logo"
            className="page-header-brand-logo-img"
            width={150}
            height={40}
          />
        </div>
      </div>
    </header>
  );
}
