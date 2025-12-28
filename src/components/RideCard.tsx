"use client";

import { useState } from 'react';
import { Ride } from '@/types';

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function RideCard({
  ride,
  onJoin,
  onDelete,
  isLoggedIn,
  currentUserEmail,
}: {
  ride: Ride;
  onJoin?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoggedIn: boolean;
  currentUserEmail: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const isCreator = currentUserEmail === ride.createdByEmail;
  const isPassenger = ride.passengerEmails.includes(currentUserEmail ?? '');
  const isFull = ride.seatsFilled >= ride.seatsTotal;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ride.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const renderJoinButton = () => {
    if (!isLoggedIn) {
      return (
        <button
          type="button"
          className="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
          disabled
        >
          Login to join
        </button>
      );
    }
    if (isCreator) return null;
    if (isFull)
      return (
        <span className="pill bg-slate-200 text-xs font-semibold text-slate-700">Full</span>
      );
    return (
      <button
        type="button"
        onClick={() => onJoin?.(ride.id)}
        disabled={isPassenger}
        className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
          isPassenger
            ? 'bg-slate-200 text-slate-600'
            : 'bg-vitBlue text-white shadow-sm hover:bg-vitBlueDark'
        }`}
      >
        {isPassenger ? 'Joined' : 'Join ride'}
      </button>
    );
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden w-80 flex-shrink-0">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
              {ride.fromType} {ride.fromValue} → {ride.toType} {ride.toValue}
            </h3>
            <p className="text-sm text-gray-500">{formatDateTime(ride.datetime)}</p>
          </div>
          <div className="ml-4">
            {isCreator ? (
              <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">You posted</span>
            ) : isPassenger ? (
              <span className="inline-block px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">You joined</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
        <span className="pill">₹{ride.totalPrice} total</span>
        <span className="pill">
          {ride.seatsFilled} / {ride.seatsTotal} seats
        </span>
        <div className="flex-1 min-w-[120px]">
          <div className="h-2 overflow-hidden rounded-full bg-vitBorder">
            <div
              className="h-full bg-vitBlueLight"
              style={{ width: `${Math.min((ride.seatsFilled / ride.seatsTotal) * 100, 100)}%` }}
            />
          </div>
        </div>
        <span className="pill">
          {ride.genderPref === 'Any'
            ? 'Any'
            : ride.genderPref === 'Male'
            ? 'Male only'
            : 'Female only'}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-800">
        <div className="flex flex-col">
          <span className="font-semibold">Contact: {ride.phone}</span>
          <a href={`tel:${ride.phone}`} className="text-xs text-vitBlueLight">
            Tap to call
          </a>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-vitBorder px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-vitBlue"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          {renderJoinButton()}
          {isCreator && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(ride.id)}
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-100"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      </div>
    </article>
  );
}
