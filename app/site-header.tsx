"use client";

/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { useEffect, useState } from "react";

type HeaderUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  freeUsed: number;
  subscribed: boolean;
  membership: {
    tier: "free" | "quarter" | "year";
    label: string;
    currentPeriodEnd: number | null;
  };
};

type MeResponse = {
  user: HeaderUser | null;
  freeLimit: number;
};

type SiteHeaderProps = {
  active: "spreads" | "cards" | "readings";
};

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M14.4 3.2a9 9 0 1 0 4.3 12.2 7 7 0 0 1-4.3-12.2z"
        fill="#ffe98a"
      />
      <path
        d="M17.6 4.2l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z"
        fill="#fff"
      />
      <circle cx="6.5" cy="17.5" r="0.9" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function GoogleLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function accountName(user: HeaderUser) {
  return user.displayName || user.email.split("@")[0] || "Arcana reader";
}

function accountInitial(user: HeaderUser) {
  return accountName(user).slice(0, 1).toUpperCase();
}

function membershipDaysLeft(user: HeaderUser) {
  const end = user.membership.currentPeriodEnd;
  if (!end) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function membershipCaption(user: HeaderUser, freeLimit: number) {
  if (user.membership.tier === "year") return "Quarterly pass · unlimited readings";
  if (user.membership.tier === "quarter") return "Monthly pass · unlimited readings";
  if (user.subscribed) return "Pro pass · unlimited readings";
  return `${Math.max(0, freeLimit - user.freeUsed)} of ${freeLimit} free readings left`;
}

function currentRedirectPath() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export default function SiteHeader({ active }: SiteHeaderProps) {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [freeLimit, setFreeLimit] = useState(2);
  const [profileOpen, setProfileOpen] = useState(false);
  const activeDays = user ? membershipDaysLeft(user) : null;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() as Promise<MeResponse> : null))
      .then((data) => {
        if (!data || cancelled) return;
        setUser(data.user);
        setFreeLimit(data.freeLimit);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  function signInHref() {
    return `/api/auth/google/start?redirect=${encodeURIComponent(currentRedirectPath())}`;
  }

  async function logout() {
    setProfileOpen(false);
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    setUser(null);
  }

  return (
    <nav className="top-nav">
      <a className="brand" href="/" aria-label="Arcana AI home">
        <span className="brand-mark">
          <LogoMark />
        </span>
        <span>Arcana</span>
        <span className="brand-ai serif">AI</span>
      </a>
      <div className="nav-links">
        <a className={`nav-pill ${active === "spreads" ? "active" : ""}`} href="/#spreads">
          Spreads
        </a>
        <a className={`nav-pill ${active === "cards" ? "active" : ""}`} href="/card" aria-current={active === "cards" ? "page" : undefined}>
          Cards
        </a>
        <a className={`nav-pill ${active === "readings" ? "active" : ""}`} href="/journals" aria-current={active === "readings" ? "page" : undefined}>
          Readings
        </a>
      </div>
      <div className="account-actions">
        {user?.subscribed ? (
          <div className="pro-pill">
            <span style={{ color: "var(--gold-bright)" }}>⚡</span>
            <span style={{ color: "var(--gold-bright)" }}>PRO</span>
            <span style={{ color: "rgba(255,255,255,.62)", fontWeight: 600 }}>
              {activeDays !== null ? `${activeDays}d left` : "Active"}
            </span>
          </div>
        ) : (
          <a className="purple-pill" href="/#spreads">
            <span style={{ color: "var(--gold-bright)" }}>⚡</span>
            <span>Go Unlimited</span>
          </a>
        )}
        {!user && (
          <a className="nav-signin" aria-label="Sign in with Google" href={signInHref()}>
            <GoogleLogo />
            <span>Sign in</span>
          </a>
        )}
        {user && (
          <div className="profile-wrap">
            <button
              className="avatar"
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="Account"
            >
              {user.avatarUrl ? <img alt="" src={user.avatarUrl} /> : accountInitial(user)}
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-head">
                  <div className="avatar large">
                    {user.avatarUrl ? <img alt="" src={user.avatarUrl} /> : accountInitial(user)}
                  </div>
                  <div>
                    <strong>{accountName(user)}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="profile-status">
                  <span className={`status-pill ${user.membership.tier}`}>
                    {user.membership.tier === "free" ? "FREE" : "PRO"}
                  </span>
                  <div>
                    <strong>{user.membership.label}</strong>
                    <span>{membershipCaption(user, freeLimit)}</span>
                  </div>
                  {!user.subscribed && (
                    <a className="mini-upgrade" href="/#spreads">
                      Upgrade
                    </a>
                  )}
                </div>
                <a className="profile-action" href="/journals" onClick={() => setProfileOpen(false)}>
                  Your readings
                </a>
                <button className="profile-action" onClick={() => void logout()}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
