export type DashboardStats = {
  totalBookings: number;
  upcomingCheckIns: number;
  activeRooms: number;
};

export type RoomSummary = {
  id: number;
  title: string;
  price?: number | null;
};

export type BookingRow = {
  id: number;
  room_id: number | null;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_price: number | null;
  payment_status: string | null;
  unit_name?: string | null;
  created_at: string;
};

export type RoomRow = {
  id: number;
  title: string;
  type: string;
  location: string;
  price: number | null;
  badge: string | null;
  beds: number | null;
  baths: number | null;
  guests: number | null;
  image: string | null;
};

export type RoomPhotoRow = {
  id: number;
  room_id: number;
  url: string;
  storage_path: string;
  created_at: string;
};

