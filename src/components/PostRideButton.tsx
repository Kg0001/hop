"use client";

import { useState } from 'react';
import { PostRideModal } from './PostRideModal';
import { RideInput } from '@/types';

interface PostRideButtonProps {
  onCreate?: (data: Omit<RideInput, 'createdByEmail'>) => Promise<void> | void;
  disabled?: boolean;
}

export function PostRideButton({ onCreate, disabled = false }: PostRideButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: Omit<RideInput, 'createdByEmail'>) => {
    if (onCreate) {
      await onCreate(data);
    }
  };

  return (
    <>
      {/* Single wide centered button - Primary CTA */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-md mx-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
        disabled={disabled}
      >
        + Post Ride
      </button>

      {/* Scrollable Modal */}
      <PostRideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        disabled={disabled}
      />
                </svg>
      />
    </>
  );
}
