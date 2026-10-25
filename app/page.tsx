"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError("Please use a valid @gmail.com email address.");
      return;
    }

    if (password.length <= 8) {
      setError("Your password must be more than 8 characters.");
      return;
    }

    window.localStorage.setItem("scribble-user", email.trim());
    router.push("/notes");
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Sign in to Scribble">
        <div className="welcome-panel">
          <Link className="brand" href="/" aria-label="Scribble home">
            <span className="brand-mark" aria-hidden="true">s.</span>
            scribble
          </Link>
          <div className="welcome-copy">
            <span className="eyebrow">YOUR SPACE TO THINK</span>
            <h1>Good ideas deserve a place to land.</h1>
            <p>Gather your thoughts, make a little room for creativity, and find your focus.</p>
          </div>
          <div className="note-illustration" aria-hidden="true">
            <div className="sun-shape" />
            <div className="paper-shape">
              <span className="paper-sparkle">✳</span>
              <span className="paper-line paper-line-long" />
              <span className="paper-line paper-line-medium" />
              <span className="paper-line paper-line-short" />
              <span className="paper-heart">♡</span>
            </div>
            <span className="floating-dot dot-one" />
            <span className="floating-dot dot-two" />
          </div>
          <p className="welcome-footnote">A softer place for your next big thing.</p>
        </div>

        <div className="form-panel">
          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">s.</span>
            scribble
          </div>
          <div className="form-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Let&apos;s get you in.</h2>
            <p>Your notes have been waiting for you.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              autoComplete="email"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@gmail.com"
              type="email"
              value={email}
            />

            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              <span>More than 8 characters</span>
            </div>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              type="password"
              value={password}
            />

            <button className="primary-button" type="submit">
              Open my notes <span aria-hidden="true">→</span>
            </button>
            <p aria-live="polite" className={`form-error${error ? " is-visible" : ""}`}>
              {error || "\u00a0"}
            </p>
          </form>
          <p className="form-footnote">
            <span aria-hidden="true">✦</span> Just for this little demo — no account needed.
          </p>
        </div>
      </section>
    </main>
  );
}
