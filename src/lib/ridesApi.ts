import { Ride, RideInput } from '@/types';
import { supabase } from '@/lib/supabase';

export const MH_BLOCKS = [
  'A',
  'B',
  'B ANNEX',
  'C',
  'D',
  'D ANNEX',
  'E',
  'F',
  'G',
  'H',
  'J',
  'J ANNEX',
  'K',
  'L',
  'M',
  'M ANNEX',
  'N',
  'N ANNEX',
  'P',
  'Q',
  'R',
  'S',
  'T',
];

export const LH_BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'RGT H', 'GH ANNEX'];

// Shared city/transport locations used across filters and modal
export const CITY_LOCATIONS = ['Katpadi Station', 'Bangalore Airport', 'Chennai Airport'];

/**
 * Fetch all rides from Supabase, ordered by creation date (newest first)
 */
export async function fetchRides(): Promise<Ride[]> {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rides:', error);
    throw new Error('Failed to fetch rides');
  }

  return data || [];
}

/**
 * Fetch rides created by current user
 */
export async function fetchMyRides(userId: string | null, email: string): Promise<Ride[]> {
  console.log('🔄 Fetching My Rides:', { userId, email });

  // Try by userId first, then fall back to email
  let query = supabase
    .from('rides')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('created_by', userId);
  } else {
    query = query.eq('createdByEmail', email);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Error fetching my rides:', error);
    throw new Error('Failed to fetch my rides');
  }

  console.log('✅ Fetched my rides:', data?.length ?? 0);
  return data || [];
}

/**
 * Fetch rides where user is a passenger (by email in passengerEmails array)
 */
export async function fetchJoinedRides(email: string): Promise<Ride[]> {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .ilike('passengerEmails', `%${email}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching joined rides:', error);
    throw new Error('Failed to fetch joined rides');
  }

  return data || [];
}

/**
 * Create a new ride in Supabase
 */
export async function createRide(input: RideInput): Promise<Ride> {
  const newRide = {
    createdByEmail: input.createdByEmail,
    created_by: input.created_by,
    fromType: input.fromType,
    fromValue: input.fromValue,
    toType: input.toType,
    toValue: input.toValue,
    datetime: input.datetime,
    totalPrice: input.totalPrice,
    seatsTotal: input.seatsTotal,
    genderPref: input.genderPref,
    phone: input.phone,
    seatsFilled: 0,
    passengerEmails: [],
  };

  const { data, error } = await supabase
    .from('rides')
    .insert(newRide)
    .select()
    .single();

  if (error) {
    console.error('Error creating ride:', error);
    throw new Error(error.message || 'Failed to create ride');
  }

  return data;
}

/**
 * Join a ride - add user email to passengerEmails and increment seatsFilled
 */
export async function joinRide(rideId: string, email: string): Promise<Ride> {
  // First, fetch the current ride
  const { data: ride, error: fetchError } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single();

  if (fetchError || !ride) {
    throw new Error('Ride not found');
  }

  // Check if user already joined
  if ((ride.passengerEmails ?? []).includes(email)) {
    return ride;
  }

  // Check if ride is full
  if (ride.seatsFilled >= ride.seatsTotal) {
    throw new Error('Ride is full');
  }

  // Update the ride
  const { data: updated, error: updateError } = await supabase
    .from('rides')
    .update({
      seatsFilled: ride.seatsFilled + 1,
      passengerEmails: [...(ride.passengerEmails ?? []), email],
    })
    .eq('id', rideId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error('Error joining ride:', updateError);
    throw new Error('Failed to join ride');
  }

  return updated;
}

/**
 * Leave a ride - remove user email from passengerEmails and decrement seatsFilled
 */
export async function unjoinRide(rideId: string, email: string): Promise<Ride> {
  // First, fetch the current ride
  const { data: ride, error: fetchError } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single();

  if (fetchError || !ride) {
    throw new Error('Ride not found');
  }

  // Check if user is in the ride
  if (!(ride.passengerEmails ?? []).includes(email)) {
    return ride; // User wasn't in the ride anyway
  }

  // Update the ride
  const { data: updated, error: updateError } = await supabase
    .from('rides')
    .update({
      seatsFilled: Math.max(0, ride.seatsFilled - 1),
      passengerEmails: (ride.passengerEmails ?? []).filter(e => e !== email),
    })
    .eq('id', rideId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error('Error leaving ride:', updateError);
    throw new Error('Failed to leave ride');
  }

  return updated;
}

/**
 * Delete a ride - only the creator can delete
 * Uses created_by (userId) as primary check, falls back to createdByEmail
 */
export async function deleteRide(rideId: string, userId: string | null, email: string): Promise<void> {
  console.log('🗑️ Attempting to delete ride:', { rideId, userId, email });

  // First, verify the user is the creator
  const { data: ride, error: fetchError } = await supabase
    .from('rides')
    .select('id, createdByEmail, created_by')
    .eq('id', rideId)
    .single();

  if (fetchError || !ride) {
    console.error('❌ Ride not found:', fetchError);
    throw new Error('Ride not found');
  }

  console.log('📋 Found ride:', ride);

  // Check authorization: creator match by userId OR email
  const isCreator = 
    (userId && ride.created_by === userId) || 
    ride.createdByEmail === email;

  if (!isCreator) {
    console.error('❌ Unauthorized: user is not the creator');
    throw new Error('Only the creator can delete this ride');
  }

  // Delete the ride with confirmation
  const { error: deleteError, data } = await supabase
    .from('rides')
    .delete()
    .eq('id', rideId)
    .select();

  if (deleteError) {
    console.error('❌ Error deleting ride:', deleteError);
    throw new Error(`Failed to delete ride: ${deleteError.message}`);
  }

  console.log('✅ Ride deleted successfully:', data);
}
