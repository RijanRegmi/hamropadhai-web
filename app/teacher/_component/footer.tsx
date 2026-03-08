import React from "react";
import "./footer.css";
import Books from "./../../../assets/images/books.png";
import HamroPadhai from "./../../../assets/images/HamroPadhai.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hp-footer">
      {/* Wave divider */}
      <div className="hp-footer-wave">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="hp-footer-body">
        <div className="hp-footer-inner">
          {/* ── Brand column ── */}
          <div className="hp-footer-brand">
            <div className="hp-footer-logo">
              <div className="hp-footer-logo-icon">
                <img src={Books.src} alt="Books" />
              </div>
              <img
                src={HamroPadhai.src}
                alt="HamroPadhai"
                className="hp-footer-logo-text"
              />
            </div>
            <p className="hp-footer-tagline">
              Empowering students and teachers with smarter school management.
            </p>
          </div>

          {/* ── Links columns ── */}
          <div className="hp-footer-links-grid">
            <div className="hp-footer-col">
              <h4 className="hp-footer-col-title">Quick Links</h4>
              <ul className="hp-footer-list">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/features">Features</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </div>

            <div className="hp-footer-col">
              <h4 className="hp-footer-col-title">Resources</h4>
              <ul className="hp-footer-list">
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">User Guide</a>
                </li>
                <li>
                  <a href="#">Announcements</a>
                </li>
                <li>
                  <a href="#">Updates</a>
                </li>
              </ul>
            </div>

            <div className="hp-footer-col">
              <h4 className="hp-footer-col-title">Contact</h4>
              <ul className="hp-footer-list hp-footer-contact">
                <li>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>hamropadhai8@gmail.com</span>
                </li>
                <li>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+977-9869061333</span>
                </li>
                <li>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Kathmandu, Nepal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="hp-footer-bottom">
          <div className="hp-footer-bottom-inner">
            <p className="hp-footer-copy">
              © {currentYear} HamroPadhai. All rights reserved.
            </p>
            <div className="hp-footer-legal">
              <a href="#">Privacy Policy</a>
              <span className="hp-footer-dot">·</span>
              <a href="#">Terms of Service</a>
              <span className="hp-footer-dot">·</span>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
