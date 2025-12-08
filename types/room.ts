// Room Types

export interface Room {
  id: string;
  branch_id: string | null;
  name: string;
  room_type: string;
  capacity: number | null;
  amenities: string[] | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomFormData {
  name: string;
  branch_id: string | null;
  room_type: string;
  capacity: number | null;
  amenities: string[] | null;
  status: string;
}



