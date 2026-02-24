export type DashboardStats = {
  totalBookings: number;
  upcomingCheckIns: number;
  activeHomestays: number;
  bookings?: any[];
};

export type RoomSummary = {
  id: number;
  title: string;
  price?: number | null;
  basic_price?: number | null;
  full_price?: number | null;
};

export type BookingRow = {
  id: number;
  room_id: number | null;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  check_in_time?: string;
  check_out_time?: string;
  total_price: number | null;
  package_name?: string | null;
  units_count?: number | null;
  payment_status: string | null;
  unit_name?: string | null;
  ic_number?: string | null;
  amount_paid?: number | null;
  admin_notes?: string | null;
  created_at: string;
};

export type RoomRow = {
  id: number;
  title: string;
  type: string;
  location: string;
  price: number | null;
  basic_price: number | null;
  full_price: number | null;
  badge: string | null;
  beds: number | null;
  baths: number | null;
  guests: number | null;
  image: string | null;
  description: string | null;
  amenities: string | null;
};

export type RoomPhotoRow = {
  id: number;
  room_id: number;
  url: string;
  storage_path: string;
  created_at: string;
};

