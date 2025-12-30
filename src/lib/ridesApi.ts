import { Ride, RideInput } from '@/types';

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

export const CITY_LOCATIONS = ['Main Gate', 'Railway Station', 'City Center', 'Airport'];

// In-memory mock; replace with Supabase queries while preserving signatures
let rides: Ride[] = [
  {
    id: crypto.randomUUID(),
    createdByEmail: 'hostel.mh@example.com',
    fromType: 'MH',
    fromValue: 'J',
    toType: 'CITY',
    toValue: 'Airport',
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    totalPrice: 900,
    seatsTotal: 4,
    seatsFilled: 1,
    genderPref: 'Any',
    phone: '+91 9876543210',
    passengerEmails: ['hostel.mh@example.com'],
  },
  {
    id: crypto.randomUUID(),
    createdByEmail: 'lh.student@example.com',
    fromType: 'LH',
    fromValue: 'C',
    toType: 'CITY',
    toValue: 'Railway Station',
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    totalPrice: 450,
    seatsTotal: 3,
    seatsFilled: 0,
    genderPref: 'Female',
    phone: '+91 9988776655',
    passengerEmails: [],
  },
];

export async function fetchRides(): Promise<Ride[]> {
  return Promise.resolve([...rides]);
}

export async function createRide(input: RideInput): Promise<Ride> {
  const ride: Ride = {
    ...input,
    id: crypto.randomUUID(),
    seatsFilled: 0,
    passengerEmails: [],
  };
  rides = [ride, ...rides];
  return Promise.resolve(ride);
}

export async function joinRide(rideId: string, email: string): Promise<Ride> {
  const idx = rides.findIndex((ride) => ride.id === rideId);
  if (idx === -1) {
    throw new Error('Ride not found');
  }
  const ride = rides[idx];
  if (ride.passengerEmails.includes(email)) {
    return Promise.resolve(ride);
  }
  if (ride.seatsFilled >= ride.seatsTotal) {
    throw new Error('Ride is full');
  }
  const updated: Ride = {
    ...ride,
    seatsFilled: ride.seatsFilled + 1,
    passengerEmails: [...ride.passengerEmails, email],
  };
  rides[idx] = updated;
  return Promise.resolve(updated);
}

export async function deleteRide(rideId: string, email: string): Promise<void> {
  const ride = rides.find((r) => r.id === rideId);
  if (!ride) {
    return Promise.resolve();
  }
  if (ride.createdByEmail !== email) {
    throw new Error('Only the creator can delete this ride');
  }
  rides = rides.filter((r) => r.id !== rideId);
  return Promise.resolve();
}
