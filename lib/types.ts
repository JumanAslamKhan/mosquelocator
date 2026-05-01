export type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Jumuah?: string;
};

export type MosqueTiming = {
  fajr: string;
  sunrise?: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumuah?: string;
  jumuah2?: string;
  jumuah3?: string;
};

export type Mosque = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  timings: MosqueTiming | null;
  created_at: string;
  owner_id: string | null;
  city: string | null;
  description: string | null;
  facilities: string[];
  photos: string[];
  distanceKm?: number;
  distanceLabel?: string;
};

export type MosqueInput = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string | null;
  timings?: MosqueTiming | null;
  owner_id?: string | null;
  city?: string | null;
  description?: string | null;
  facilities?: string[];
  photos?: string[];
};