"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { LoginBox } from '@/components/LoginBox';
import { RideCard } from '@/components/RideCard';
import { RideFilters, DestinationFilter, GenderFilter } from '@/components/RideFilters';
import { MyRidesSection } from '@/components/MyRidesSection';
import { PostRideButton } from '@/components/PostRideButton';
import { createRide, deleteRide, joinRide } from '@/lib/ridesApi';
import { supabase } from '@/lib/supabase';
import { Ride, RideInput } from '@/types';

function HopOnPage() {
  const { isLoggedIn, currentUserEmail } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinationFilter, setDestinationFilter] = useState<DestinationFilter>('All');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'my'>('browse');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Auth error:', authError);
        }
        setCurrentUserId(authData?.user?.id ?? null);

        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Fetch error:', error);
          setRides([]);
          return;
        }

        setRides(data || []);
      } catch (error) {
        console.error('Error loading rides:', error);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const fetchMyRides = useCallback(async () => {
    console.log('🔄 Fetching My Rides...');
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    setCurrentUserId(userId ?? null);
    console.log('User ID:', userId);

    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('created_by', userId || '')
      .order('created_at', { ascending: false });

    console.log('My Rides data:', data);
    if (error) console.error('Error:', error);
    setMyRides(data || []);
  }, []);

  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyRides();
    }
  }, [activeTab, fetchMyRides]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyRides();
    }
  }, [isLoggedIn, fetchMyRides]);

  const toTime = (ride: Ride) => {
    const dateString = ride.datetime
      ? ride.datetime
      : ride.travel_date && ride.travel_time
      ? `${ride.travel_date}T${ride.travel_time}`
      : null;

    const time = dateString ? new Date(dateString).getTime() : Number.POSITIVE_INFINITY;
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
  };

  const filteredRides = useMemo(() => {
    if (rides.length === 0) return [];

    const now = Date.now();

    return rides
      .filter((ride) => {
        const time = toTime(ride);
        if (!Number.isFinite(time)) return false;
        return time > now;
      })
      .filter((ride) => {
        if (destinationFilter === 'All') return true;
        if (destinationFilter === 'MH' || destinationFilter === 'LH') {
          return ride.toType === destinationFilter;
        }

        const destination = ride.toValue || ride.to || '';
        return destination.includes(destinationFilter || '');
      })
      .filter((ride) => {
        if (genderFilter === 'All') return true;
        const pref = ride.genderPref || ride.preferred_gender || 'Any';
        return pref === genderFilter;
      })
      .sort((a, b) => toTime(a) - toTime(b));
  }, [rides, destinationFilter, genderFilter]);

  const postedRides = useMemo(() => myRides, [myRides]);

  const joinedRides = useMemo(
    () => rides.filter((ride) => (ride.passengerEmails ?? []).includes(currentUserEmail ?? '')),
    [rides, currentUserEmail]
  );

  const handleCreateRide = async (payload: Omit<RideInput, 'createdByEmail'>) => {
    if (!currentUserEmail) return;
    const ride = await createRide({
      ...payload,
      createdByEmail: currentUserEmail,
      created_by: currentUserId,
    });
    const normalized: Ride = {
      ...ride,
      createdByEmail:
        ride.createdByEmail ??
        (ride as Record<string, unknown>).createdbyemail?.toString() ??
        currentUserEmail,
      created_by: ride.created_by ?? currentUserId ?? null,
    };

    setRides((prev) => [normalized, ...(prev ?? [])]);
    setMyRides((prev) => [normalized, ...(prev ?? [])]);
    setStatus('Ride posted!');
  };

  const handleJoinRide = async (id: string) => {
    if (!currentUserEmail) return;
    const target = rides?.find((ride) => ride.id === id);
    if (!target) {
      setStatus('Ride not found');
      return;
    }
    if ((target.passengerEmails ?? []).includes(currentUserEmail)) {
      setStatus('You already joined this ride');
      return;
    }
    if (target.seatsFilled >= target.seatsTotal) {
      setStatus('Ride is full');
      return;
    }

    try {
      const updated = await joinRide(id, currentUserEmail);
      setRides((prev) => (prev ?? []).map((ride) => (ride.id === id ? updated : ride)));
      setStatus('Joined ride');
    } catch (error) {
      console.error('Join ride failed:', error);
      setStatus(error instanceof Error ? error.message : 'Could not join ride');
    }
  };

  const handleDeleteRide = async (id: string) => {
    if (!currentUserEmail) return;
    try {
      await deleteRide(id, currentUserEmail);
      setRides((prev) => (prev ?? []).filter((ride) => ride.id !== id));
      setMyRides((prev) => (prev ?? []).filter((ride) => ride.id !== id));
      setStatus('Ride deleted');
    } catch (error) {
      console.error('Delete ride failed:', error);
      setStatus(error instanceof Error ? error.message : 'Could not delete ride');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vitGrey to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 md:space-y-8">
          <div className="text-center space-y-4">
            <div className="text-4xl md:text-6xl">🚕</div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Hop On Da!
            </h1>
            <p className="text-sm text-slate-500">
              Please log in to access the platform.
            </p>
          </div>
          <div className="card p-6 md:p-8 shadow-xl">
            <LoginBox />
          </div>
          <p className="text-xs text-slate-500 text-center max-w-sm">
            This is a student-made site, created to help fellow students and has no affiliation with the university.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container-narrow py-6 md:py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'browse'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Rides
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'my'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Rides
            </button>
          </div>
        </div>

        {/* Filters - Only show on Browse tab */}
        {activeTab === 'browse' && (
          <div className="mb-8">
            <RideFilters
              destination={destinationFilter}
              gender={genderFilter}
              onDestinationChange={setDestinationFilter}
              onGenderChange={setGenderFilter}
              onCreate={handleCreateRide}
              disabled={!isLoggedIn}
            />
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              {status}
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'browse' ? (
          /* Browse Rides Content */
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {loading ? (
                <div className="w-80 flex-shrink-0 text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading rides...</p>
                </div>
              ) : !rides || rides.length === 0 ? (
                <div className="w-full flex-shrink-0">
                  <div className="card p-6 text-center text-sm text-gray-600">No rides available</div>
                </div>
              ) : filteredRides.length === 0 ? (
                <div className="w-full flex-shrink-0">
                  <div className="card p-6 text-center text-sm text-gray-600">No rides match your filters</div>
                </div>
              ) : (
                filteredRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onJoin={handleJoinRide}
                    onDelete={handleDeleteRide}
                    isLoggedIn={isLoggedIn}
                    currentUserEmail={currentUserEmail}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* My Rides Content */
          <MyRidesSection
            posted={postedRides}
            joined={joinedRides}
            onJoin={handleJoinRide}
            onDelete={handleDeleteRide}
            isLoggedIn={isLoggedIn}
            currentUserEmail={currentUserEmail}
          />
        )}
      </main>
      {/* Footer */}
      <footer className="text-center text-xs md:text-sm text-gray-500 py-8 border-t border-gray-200 mt-16">
        <p>
          This platform only lists rides; you are responsible for your own safety and travel arrangements.
        </p>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <HopOnPage />
    </AuthProvider>
  );
}
