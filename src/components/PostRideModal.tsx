"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RideInput } from '@/types';
import { CITY_LOCATIONS, LH_BLOCKS, MH_BLOCKS } from '@/lib/ridesApi';

const seatOptions = [1, 2, 3, 4, 5, 6];

interface PostRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RideInput, 'createdByEmail'>) => Promise<void> | void;
  disabled?: boolean;
}

export function PostRideModal({ isOpen, onClose, onSubmit, disabled = false }: PostRideModalProps) {
  const [fromType, setFromType] = useState<'MH' | 'LH' | 'CITY'>('MH');
  const [toType, setToType] = useState<'MH' | 'LH' | 'CITY'>('CITY');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState(CITY_LOCATIONS[0] ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [seatsTotal, setSeatsTotal] = useState<number>(3);
  const [genderPref, setGenderPref] = useState<'Any' | 'Male' | 'Female'>('Any');
  const [phone, setPhone] = useState('');
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const optionsByType = useMemo(() => ({
    MH: MH_BLOCKS,
    LH: LH_BLOCKS,
    CITY: CITY_LOCATIONS,
  }), []);

  useEffect(() => {
    setFromValue((prev) => {
      const options = optionsByType[fromType] ?? [];
      return options.includes(prev) ? prev : options[0] ?? '';
    });
  }, [fromType, optionsByType]);

  useEffect(() => {
    setToValue((prev) => {
      const options = optionsByType[toType] ?? [];
      return options.includes(prev) ? prev : options[0] ?? '';
    });
  }, [toType, optionsByType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!date || !time || !fromValue || !toValue || !phone || totalPrice <= 0 || seatsTotal < 1) {
      setMessage('Please fill all fields with valid values.');
      return;
    }
    // Supabase payload for rides table
    const payload = {
      from: fromValue,
      to: toValue,
      travel_date: date,
      travel_time: time,
      preferred_gender: genderPref,
      cab_price: Number(totalPrice),
      seats: Number(seatsTotal),
      contact: phone,
      hostel_block: fromType === 'MH' ? fromValue : null,
    };

    console.log('PostRideModal submit payload:', payload);
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert([payload]);

      if (error) {
        console.error('Supabase insert error:', {
          message: error.message,
          details: (error as { details?: string }).details,
          hint: (error as { hint?: string }).hint,
          code: error.code,
        });
        setMessage(error.message || 'Could not post ride. Try again.');
        return;
      }

      setMessage('Ride posted successfully!');
      onClose();
      // Reset form
      setFromType('MH');
      setToType('CITY');
      setFromValue('');
      setToValue(CITY_LOCATIONS[0] ?? '');
      setDate('');
      setTime('');
      setTotalPrice(0);
      setSeatsTotal(3);
      setGenderPref('Any');
      setPhone('');
    } catch (err: unknown) {
      console.error('Post ride failed:', err);
      setMessage(err instanceof Error ? err.message : 'Could not post ride. Try again.');
    } finally {
      setPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">
        {/* Fixed Header */}
        <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Post a New Ride</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
            {/* From Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">From</label>
              <div className="flex gap-2">
                {(['MH', 'LH', 'CITY'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFromType(type)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                      fromType === type
                        ? 'bg-vitBlue text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-vitBlue hover:bg-slate-50'
                    }`}
                    disabled={disabled}
                  >
                    {type === 'CITY' ? 'City' : type}
                  </button>
                ))}
              </div>
              
              {/* Conditional MH Block dropdown */}
              {fromType === 'MH' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">MH Block</label>
                  <select
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                    disabled={disabled}
                    required
                  >
                    <option value="" disabled>
                      Select MH Block
                    </option>
                    {optionsByType[fromType].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* LH or City dropdown */}
              {fromType !== 'MH' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {fromType === 'LH' ? 'LH Block' : 'Location'}
                  </label>
                  <select
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                    disabled={disabled}
                    required
                  >
                    <option value="" disabled>
                      Select {fromType === 'LH' ? 'LH Block' : 'Location'}
                    </option>
                    {optionsByType[fromType].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* To Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">To</label>
              <div className="flex gap-2">
                {(['MH', 'LH', 'CITY'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setToType(type)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                      toType === type
                        ? 'bg-vitBlue text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-vitBlue hover:bg-slate-50'
                    }`}
                    disabled={disabled}
                  >
                    {type === 'CITY' ? 'City' : type}
                  </button>
                ))}
              </div>
              
              {/* Conditional dropdown for To */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {toType === 'MH' ? 'MH Block' : toType === 'LH' ? 'LH Block' : 'Destination'}
                </label>
                <select
                  value={toValue}
                  onChange={(e) => setToValue(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                  disabled={disabled}
                  required
                >
                  {optionsByType[toType].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-900">Travel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                  disabled={disabled}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-900">Travel Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                  disabled={disabled}
                  required
                />
              </div>
            </div>

            {/* Preferred Gender */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-900">Preferred Gender</label>
              <select
                value={genderPref}
                onChange={(e) => setGenderPref(e.target.value as 'Any' | 'Male' | 'Female')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                disabled={disabled}
              >
                <option value="Any">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Price and Seats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-900">Total Cab ₹</label>
                <input
                  type="number"
                  min={1}
                  value={totalPrice || ''}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  placeholder="e.g. 400"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                  disabled={disabled}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-900">Seats Total</label>
                <select
                  value={seatsTotal}
                  onChange={(e) => setSeatsTotal(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                  disabled={disabled}
                >
                  {seatOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-900">Contact Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-vitBlue focus:ring-2 focus:ring-vitBlue/20 focus:outline-none bg-white"
                disabled={disabled}
                required
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                message.includes('success') || message.includes('posted')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Sticky Footer with Submit Button */}
          <div className="sticky bottom-0 p-6 bg-white border-t shadow-lg rounded-b-2xl z-10">
            <button
              type="submit"
              disabled={disabled || posting}
              className="w-full rounded-lg bg-vitBlue px-4 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-vitBlueDark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {posting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post Ride'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
