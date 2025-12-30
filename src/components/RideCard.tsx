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
  const isPassenger = (ride.passengerEmails ?? []).includes(currentUserEmail ?? '');
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
          className="w-full rounded-lg bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm"
          disabled
        >
          Login to join
        </button>
      );
    }
    if (isCreator) return null;
    if (isFull)
      return (
        <button
          type="button"
          className="w-full rounded-lg bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600"
          disabled
        >
          Full
        </button>
      );
    return (
      <button
        type="button"
        onClick={() => onJoin?.(ride.id)}
        disabled={isPassenger}
        className={`w-full rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition ${
          isPassenger
            ? 'bg-gray-300 text-gray-600'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isPassenger ? 'Joined' : 'Join Ride'}
      </button>
    );
  };
 return (
  <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden w-80 flex-shrink-0">
    <div className="p-4 flex flex-col h-full space-y-4">
      {/* 1. Route + date + gender badge */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {ride.toType === 'CITY' && (ride.toValue === 'Bangalore' || ride.toValue === 'Chennai' || ride.toValue === 'Tirupati') ? `${ride.toValue} - Airport` : ride.fromType === 'CITY' && (ride.fromValue === 'Bangalore' || ride.fromValue === 'Chennai' || ride.fromValue === 'Tirupati') ? `${ride.fromValue} - Airport` : ride.fromType === 'CITY' ? ride.fromValue : `${ride.fromType} ${ride.fromValue}`} → {ride.toType === 'CITY' && (ride.toValue === 'Bangalore' || ride.toValue === 'Chennai' || ride.toValue === 'Tirupati') ? `${ride.toValue} - Airport` : ride.toType === 'CITY' ? ride.toValue : `${ride.toType} ${ride.toValue}`}
          </h3>
          <p className="text-sm text-gray-500">{formatDateTime(ride.datetime)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            ride.genderPref === 'Any' ? 'bg-gray-100 text-gray-700' :
            ride.genderPref === 'Male' ? 'bg-blue-50 text-blue-700' :
            'bg-pink-50 text-pink-700'
          }`}>
            {ride.genderPref === 'Any' ? 'Any' : 
             ride.genderPref === 'Male' ? 'Male only' : 'Female only'}
          </span>
          {isCreator && <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">You posted</span>}
          {isPassenger && <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">You joined</span>}
        </div>
      </div>

      {/* 2. Seats count + progress bar */}
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
          {ride.seatsFilled} / {ride.seatsTotal} seats
        </span>
        <div className="flex-1 max-w-[120px]">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-200"
              style={{ width: `${Math.min((ride.seatsFilled / ride.seatsTotal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Price + Contact info */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <div className="text-2xl font-bold text-blue-400">
            ₹{ride.totalPrice.toString().slice(0, 5)}
          </div>
          <div className="text-xs text-gray-500">total</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{ride.phone}</div>
            <a href={`tel:${ride.phone}`} className="text-xs text-blue-500 hover:underline">
              Tap to call
            </a>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          {isCreator && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(ride.id)}
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* 4. [JOIN RIDE] ← BOTTOM SECTION (final element) */}
      <div className="border-t border-gray-100 pt-4 mt-auto">
        <div className="w-full">
          {renderJoinButton()}
        </div>
      </div>
    </div>
    </article>
  );
}