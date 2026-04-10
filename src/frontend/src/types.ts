// Shared TypeScript types matching backend contracts

export type Role = "owner" | "driver" | "customer";
export type DutyStatus = "onDuty" | "offDuty";
export type PickupStatus = "pending" | "accepted" | "completed" | "cancelled";
export type TipProvider =
  | "phonePe"
  | "gPay"
  | "paytm"
  | "postOfficeSavings"
  | "other";
export type ComplaintCategory =
  | "missedPickup"
  | "driverBehavior"
  | "vehicleCondition"
  | "other";

export interface DriverProfile {
  id: string;
  name: string;
  age: number;
  phone: string;
  bloodGroup: string;
  address: string;
  photoUrl?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
}

export interface DriverState {
  driverId: string;
  dutyStatus: DutyStatus;
  fillPercent: number;
  lat?: number;
  lon?: number;
  lastUpdated: bigint;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  capacity: number;
  assignedDriverId?: string;
}

export interface PickupRequest {
  id: string;
  customerId: string;
  address: string;
  wasteType: string;
  status: PickupStatus;
  lat?: number;
  lon?: number;
  createdAt: bigint;
  driverId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: bigint;
  read: boolean;
}

export interface Thread {
  peerId: string;
  messages: Message[];
  unreadCount: number;
}

export interface Tip {
  id: string;
  fromCustomerId: string;
  toDriverId: string;
  amount: number;
  provider: TipProvider;
  createdAt: bigint;
}

export interface Complaint {
  id: string;
  submittedBy: string;
  driverId?: string;
  category: ComplaintCategory;
  description: string;
  createdAt: bigint;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  principalId: string | null;
}
