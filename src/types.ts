export type Ride = {
  id: string;
  createdByEmail: string;
  fromType: 'MH' | 'LH' | 'CITY';
  fromValue: string;
  toType: 'MH' | 'LH' | 'CITY';
  toValue: string;
  datetime: string;
  totalPrice: number;
  seatsTotal: number;
  seatsFilled: number;
  genderPref: 'Any' | 'Male' | 'Female';
  phone: string;
  passengerEmails: string[];
  // Supabase columns (optional, keep compatibility with legacy shape)
  created_by?: string | null;
  created_at?: string;
  from?: string;
  to?: string;
  travel_date?: string;
  travel_time?: string;
  preferred_gender?: string;
  cab_price?: number;
  seats?: number;
  contact?: string;
  hostel_block?: string | null;
};

export type RideInput = Omit<Ride, 'id' | 'seatsFilled' | 'passengerEmails'>;
