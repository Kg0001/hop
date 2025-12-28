"use client";

import { useState } from 'react';
import { LH_BLOCKS, MH_BLOCKS } from '@/lib/ridesApi';

type LocationType = 'airport' | 'katpadi' | 'hostel';

interface HierarchicalDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function HierarchicalDropdown({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Select location"
}: HierarchicalDropdownProps) {
  const [type, setType] = useState<LocationType | ''>('');
  const [sub, setSub] = useState('');
  const [hostelType, setHostelType] = useState<'MH' | 'LH'>('MH');

  const handleType = (t: LocationType) => {
    setType(t);
    setSub('');
    if (t === 'katpadi') onChange('Katpadi Jn');
    else onChange('');
  };

  const handleSub = (s: string) => {
    setSub(s);
    if (type === 'airport') onChange(`Airport-${s}`);
    else if (type === 'hostel') onChange(`Hostel-${hostelType}-${s}`);
  };

  return (
    <div className="space-y-2">
      <select 
        value={type} 
        onChange={(e) => handleType(e.target.value as LocationType)} 
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        <option value="airport">Airport</option>
        <option value="katpadi">Katpadi Jn</option>
        <option value="hostel">Hostel</option>
      </select>
      
      {type === 'airport' && (
        <select 
          value={sub} 
          onChange={(e) => handleSub(e.target.value)} 
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
          disabled={disabled}
        >
          <option value="">Select airport</option>
          <option value="Chennai">Chennai</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Tirupati">Tirupati</option>
        </select>
      )}
      
      {type === 'hostel' && (
        <>
          <select 
            value={hostelType} 
            onChange={(e) => setHostelType(e.target.value as 'MH' | 'LH')} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            disabled={disabled}
          >
            <option value="MH">MH</option>
            <option value="LH">LH</option>
          </select>
          <select 
            value={sub} 
            onChange={(e) => handleSub(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            disabled={disabled}
          >
            <option value="">Select block</option>
            {(hostelType === 'MH' ? MH_BLOCKS : LH_BLOCKS).map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
