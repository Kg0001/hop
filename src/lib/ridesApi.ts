import { Ride, RideInput } from '@/types';
import { supabase } from '@/lib/supabaseClient';

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
 * Create a new ride in Supabase
 */
export async function createRide(input: RideInput): Promise<Ride> {
  const newRide = {
    createdByEmail: input.createdByEmail,
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
    throw new Error('Failed to create ride');
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
  if (ride.passengerEmails.includes(email)) {
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
      passengerEmails: [...ride.passengerEmails, email],
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
 * Delete a ride - only the creator can delete
 */
export async function deleteRide(rideId: string, email: string): Promise<void> {
  // First, verify the user is the creator
  const { data: ride, error: fetchError } = await supabase
    .from('rides')
    .select('createdByEmail')
    .eq('id', rideId)
    .single();

  if (fetchError || !ride) {
    throw new Error('Ride not found');
  }

  if (ride.createdByEmail !== email) {
    throw new Error('Only the creator can delete this ride');
  }

  // Delete the ride
  const { error: deleteError } = await supabase
    .from('rides')
    .delete()
    .eq('id', rideId);

  if (deleteError) {
    console.error('Error deleting ride:', deleteError);
    throw new Error('Failed to delete ride');
  }
}
