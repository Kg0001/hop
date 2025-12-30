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
};

export type RideInput = Omit<Ride, 'id' | 'seatsFilled' | 'passengerEmails'>;
