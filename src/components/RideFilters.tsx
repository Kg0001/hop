import { PostRideButton } from './PostRideButton';
import { RideInput } from '@/types';
import { CITY_LOCATIONS } from '@/lib/ridesApi';

export type DestinationFilter =
  | 'All'
  | 'MH'
  | 'LH'
  | 'Katpadi Station'
  | 'Bangalore Airport'
  | 'Chennai Airport';
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
  const destinationOptions: DestinationFilter[] = ['All', 'MH', 'LH', ...(CITY_LOCATIONS as DestinationFilter[])];
  
  return (
    <div className="bg-white border-b border-gray-200 pb-6">
      {/* Post Ride Button - Centered */}
      {showPostRideButton && (
        <div className="mb-6 flex justify-center">
          <PostRideButton onCreate={onCreate} disabled={disabled} />
        </div>
      )}

      {/* Destination Dropdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Destination</h3>
        <div className="w-full sm:max-w-xs">
          <select
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value as DestinationFilter)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {destinationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
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
