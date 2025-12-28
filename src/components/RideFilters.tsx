import { PostRideButton } from './PostRideButton';
import { RideInput } from '@/types';
import { useState } from 'react';

export type DestinationFilter = 'All' | '🚂Katpadi Jn' | 'Airport' | 'City Center';
export type GenderFilter = 'All' | 'Male' | 'Female';

export function RideFilters({
  destination,
  gender,
  onDestinationChange,
  onGenderChange,
  showPostRideButton = true,
  onCreate,
  disabled,
}: {
  destination: DestinationFilter;
  gender: GenderFilter;
  onDestinationChange: (value: DestinationFilter) => void;
  onGenderChange: (value: GenderFilter) => void;
  showPostRideButton?: boolean;
  onCreate?: (data: Omit<RideInput, 'createdByEmail'>) => Promise<void> | void;
  disabled?: boolean;
}) {
  const [airportSubOption, setAirportSubOption] = useState<'Bangalore' | 'Chennai' | 'Tirupati' | ''>('');
  const [citySubOption, setCitySubOption] = useState<'Bangalore' | 'Chennai' | 'Tirupati' | ''>('');
  
  return (
    <div className="bg-white border-b border-gray-200 pb-6">
      {/* Post Ride Button - Centered */}
      {showPostRideButton && (
        <div className="mb-6 flex justify-center">
          <PostRideButton onCreate={onCreate} disabled={disabled} />
        </div>
      )}

      {/* Destination Tabs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Destination</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['All', '🚂 Katpadi Jn', 'Airport', 'City Center'] as DestinationFilter[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onDestinationChange(opt)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                destination === opt
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        
        {/* Airport Dropdown - Only show when Airport is selected */}
        {destination === 'Airport' && (
          <div className="mt-4">
            <select
              value={airportSubOption}
              onChange={(e) => setAirportSubOption(e.target.value as 'Bangalore' | 'Chennai' | 'Tirupati' | '')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Airport</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Tirupati">Tirupati</option>
            </select>
          </div>
        )}
        
        {/* City Center Dropdown - Only show when City Center is selected */}
        {destination === 'City Center' && (
          <div className="mt-4">
            <select
              value={citySubOption}
              onChange={(e) => setCitySubOption(e.target.value as 'Bangalore' | 'Chennai' | 'Tirupati' | '')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select City</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Tirupati">Tirupati</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Gender Tabs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Gender Preference</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['All', 'Male', 'Female'] as GenderFilter[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onGenderChange(opt)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                gender === opt
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
