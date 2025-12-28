"use client";

import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

function isVitEmail(email: string) {
  const lower = email.toLowerCase().trim();
  const allowedDomains = ['vit.ac.in', 'vitstudent.ac.in'];
  return allowedDomains.some((domain) => lower.endsWith('@' + domain));
}

export function LoginBox() {
  const { login, isLoggedIn, currentUserEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!isVitEmail(email)) {
      setError('Only VIT email addresses (@vit.ac.in or @vitstudent.ac.in) are allowed.');
      return;
    }
    setError('');
    login(email.trim());
    setEmail('');
  };

  return (
    <div className="card p-4 md:p-5">
      <p className="mt-1 text-sm text-slate-600">
        Use your VIT student email to post or join rides. No password needed.
      </p>
      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="yourname@vitstudent.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none focus:ring-1 focus:ring-vitBlue"
          required
        />
        {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="rounded-md bg-vitBlue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-vitBlueDark"
        >
          Continue
        </button>
      </form>
      {isLoggedIn ? (
        <p className="mt-3 text-xs text-green-700">Logged in as {currentUserEmail}</p>
      ) : null}
    </div>
  );
}
