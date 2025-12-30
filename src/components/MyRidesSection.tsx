import { useState } from 'react';
import { Ride } from '@/types';
import { RideCard } from './RideCard';

export function MyRidesSection({
  posted,
  joined,
  onJoin,
  onDelete,
  isLoggedIn,
  currentUserEmail,
}: {
  posted: Ride[];
  joined: Ride[];
  onJoin: (id: string) => void;
  onDelete: (id: string) => void;
  isLoggedIn: boolean;
  currentUserEmail: string | null;
}) {
  const [activeTab, setActiveTab] = useState<'posted' | 'joined'>('posted');

  if (!isLoggedIn) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">My Rides</h2>
        <p className="text-sm text-gray-500">Manage your posted and joined rides</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8 border border-gray-200">
        <button
          onClick={() => setActiveTab('posted')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 text-center ${
            activeTab === 'posted'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Posted ({posted.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 text-center ${
            activeTab === 'joined'
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Joined ({joined.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posted' && (
        <div>
          {posted.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No rides posted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posted.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onJoin={onJoin}
                  onDelete={onDelete}
                  isLoggedIn={isLoggedIn}
                  currentUserEmail={currentUserEmail}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'joined' && (
        <div>
          {joined.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No rides joined yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {joined.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onJoin={onJoin}
                  onDelete={onDelete}
                  isLoggedIn={isLoggedIn}
                  currentUserEmail={currentUserEmail}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
