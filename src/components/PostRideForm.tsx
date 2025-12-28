"use client";

import { FormEvent, useState } from 'react';
import { RideInput } from '@/types';
import { HierarchicalDropdown } from './HierarchicalDropdown';

const seatOptions = [1, 2, 3, 4, 5, 6];

export function PostRideForm({
  onCreate,
  disabled,
}: {
  onCreate: (data: Omit<RideInput, 'createdByEmail'>) => Promise<void> | void;
  disabled: boolean;
}) {
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [seatsTotal, setSeatsTotal] = useState<number>(3);
  const [genderPref, setGenderPref] = useState<'Any' | 'Male' | 'Female'>('Any');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!date || !time || !fromValue || !toValue || !phone || totalPrice <= 0 || seatsTotal < 1) {
      setMessage('Please fill all fields with valid values.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setMessage('Contact number must be exactly 10 digits.');
      return;
    }
    const datetimeIso = new Date(`${date}T${time}`).toISOString();
    // Parse hierarchical values
    let parsedFromType: 'MH' | 'LH' | 'CITY' = 'CITY';
    let parsedFromValue = fromValue;
    
    if (fromValue.startsWith('Hostel-')) {
      const parts = fromValue.split('-');
      parsedFromType = parts[1] as 'MH' | 'LH';
      parsedFromValue = parts[2];
    } else if (fromValue.startsWith('Airport-')) {
      parsedFromValue = fromValue.replace('Airport-', '');
    }

    const payload: Omit<RideInput, 'createdByEmail'> = {
      fromType: parsedFromType,
      fromValue: parsedFromValue,
      toType: 'CITY',
      toValue,
      datetime: datetimeIso,
      totalPrice,
      seatsTotal,
      genderPref,
      phone: countryCode + phone,
    };
    setPosting(true);
    try {
      await onCreate(payload);
      setMessage('Ride posted!');
      setFromValue('');
      setToValue('Railway Station');
      setDate('');
      setTime('');
      setTotalPrice(0);
      setSeatsTotal(3);
      setGenderPref('Any');
      setCountryCode('+91');
      setPhone('');
    } catch (err: unknown) {
      setMessage('Could not post ride. Try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">From</label>
            <HierarchicalDropdown
              value={fromValue}
              onChange={setFromValue}
              disabled={disabled}
              placeholder="Select departure"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">To</label>
            <HierarchicalDropdown
              value={toValue}
              onChange={setToValue}
              disabled={disabled}
              placeholder="Select destination"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Travel date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none"
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Travel time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-md border border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none"
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Preferred gender</label>
            <select
              value={genderPref}
              onChange={(e) => setGenderPref(e.target.value as 'Any' | 'Male' | 'Female')}
              className="w-full rounded-md border border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none"
              disabled={disabled}
            >
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Total cab price (₹)</label>
            <input
              type="number"
              min={1}
              value={totalPrice || ''}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              className="w-full rounded-md border border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none"
              disabled={disabled}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Seats total</label>
            <select
              value={seatsTotal}
              onChange={(e) => setSeatsTotal(Number(e.target.value))}
              className="w-full rounded-md border border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none"
              disabled={disabled}
            >
              {seatOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Contact number</label>
            <div className="flex items-center">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="rounded-l-md border border-vitBorder px-2 py-2 text-sm focus:border-vitBlue focus:outline-none"
                disabled={disabled}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+60">🇲🇾 +60</option>
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only digits
                  if (value.length <= 10) setPhone(value);
                }}
                placeholder="9876543210"
                pattern="[0-9]{10}"
                maxLength={10}
                className="flex-1 rounded-r-md border border-l-0 border-vitBorder px-3 py-2 text-sm focus:border-vitBlue focus:outline-none"
                disabled={disabled}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || posting}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {posting ? 'Posting...' : 'Post ride'}
          </button>
        </div>
        {message ? <p className="text-xs font-semibold text-gray-700">{message}</p> : null}
      </form>
    </div>
  );
}
