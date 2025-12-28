"use client";

import { useState, useEffect } from 'react';
import { PostRideForm } from './PostRideForm';
import { RideInput } from '@/types';

interface PostRideButtonProps {
  onCreate?: (data: Omit<RideInput, 'createdByEmail'>) => Promise<void> | void;
  disabled?: boolean;
}

export function PostRideButton({ onCreate, disabled = false }: PostRideButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

      {/* Full Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-50">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900">Post a New Ride</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="max-w-2xl mx-auto p-4">
            <PostRideForm onCreate={onCreate || (() => {})} disabled={disabled} />
          </div>
        </div>
      )}
    </>
  );
}
