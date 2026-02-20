import Link from "next/link";
import "./not-found.css";
export default function NotFound() {
  return (
    <div className="nf-root">
      {/* Floating background blobs */}
      <div className="nf-blob nf-blob-1" />
      <div className="nf-blob nf-blob-2" />
      <div className="nf-blob nf-blob-3" />

      <div className="nf-card">
        {/* Top brand bar */}
        <div className="nf-brand">
          <span className="nf-brand-text">HamroPadhai</span>
        </div>

        {/* 404 display */}
        <div className="nf-number-wrap">
          <span className="nf-four nf-four-left">4</span>
          <div className="nf-zero-wrap">
            <div className="nf-zero">
              <div className="nf-zero-inner">
                <svg
                  width="44"
                  height="44"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <span className="nf-four nf-four-right">4</span>
        </div>

        {/* Text */}
        <div className="nf-text-section">
          <h1 className="nf-lost">Are you lost?</h1>
          <p className="nf-desc">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
            <br />
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Divider */}
        <div className="nf-divider" />

        {/* CTA */}
        <div className="nf-actions">
          <Link href="/login" className="nf-btn-primary">
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Go back
          </Link>
        </div>

        {/* Footer note */}
        <p className="nf-footer-note">Error 404 &mdash; Page not found</p>
      </div>
    </div>
  );
}
