import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MessagePublic {
    id: bigint;
    read: boolean;
    text: string;
    receiverId: UserId;
    timestamp: Timestamp;
    senderId: UserId;
}
export type Timestamp = bigint;
export interface VehiclePublic {
    id: bigint;
    vehicleNumber: string;
    assignedDriverId?: UserId;
    makeModel: string;
}
export interface SubmitComplaintInput {
    text: string;
    category: ComplaintCategory;
}
export interface PickupRequestPublic {
    id: bigint;
    status: PickupStatus;
    latitude: number;
    driverId?: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    longitude: number;
    address: string;
    customerId: UserId;
}
export type UserId = Principal;
export interface SubmitTipInput {
    driverId: UserId;
    provider: TipProvider;
    amount: bigint;
}
export type RegisterResult = {
    __kind__: "ok";
    ok: UserId;
} | {
    __kind__: "alreadyExists";
    alreadyExists: null;
};
export interface CreatePickupInput {
    latitude: number;
    longitude: number;
    address: string;
}
export interface ComplaintPublic {
    id: bigint;
    text: string;
    timestamp: Timestamp;
    category: ComplaintCategory;
    customerId: UserId;
}
export type TipProvider = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "gPay";
    gPay: null;
} | {
    __kind__: "postOfficeSavings";
    postOfficeSavings: null;
} | {
    __kind__: "paytm";
    paytm: null;
} | {
    __kind__: "phonePe";
    phonePe: null;
};
export interface GpsLocationPublic {
    latitude: number;
    active: boolean;
    longitude: number;
    timestamp: Timestamp;
}
export type ComplaintCategory = {
    __kind__: "driverBehavior";
    driverBehavior: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "missedPickup";
    missedPickup: null;
} | {
    __kind__: "vehicleCondition";
    vehicleCondition: null;
};
export interface DriverProfilePublic {
    id: UserId;
    age: bigint;
    name: string;
    photoKey?: string;
    bloodGroup: string;
    address: string;
    phone: string;
}
export interface TipPublic {
    id: bigint;
    driverId: UserId;
    provider: TipProvider;
    timestamp: Timestamp;
    customerId: UserId;
    amount: bigint;
}
export interface DriverStatePublic {
    id: UserId;
    dutyStatus: DutyStatus;
    fillPercent: bigint;
    location?: GpsLocationPublic;
}
export enum DutyStatus {
    offDuty = "offDuty",
    onDuty = "onDuty"
}
export enum PickupStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    accepted = "accepted"
}
export enum Role {
    customer = "customer",
    owner = "owner",
    driver = "driver"
}
export interface backendInterface {
    acceptPickupRequest(requestId: bigint): Promise<boolean>;
    addVehicle(vehicleNumber: string, makeModel: string, assignedDriverId: UserId | null): Promise<bigint>;
    assignDriver(vehicleId: bigint, driverId: UserId | null): Promise<void>;
    createPickupRequest(input: CreatePickupInput): Promise<bigint>;
    getDriverProfile(driverId: UserId): Promise<DriverProfilePublic | null>;
    getDriverState(driverId: UserId): Promise<DriverStatePublic | null>;
    getMessageThread(otherId: UserId): Promise<Array<MessagePublic>>;
    getMyPickupRequest(requestId: bigint): Promise<PickupRequestPublic | null>;
    getMyRole(): Promise<Role | null>;
    getVehicle(id: bigint): Promise<VehiclePublic | null>;
    isRegistered(): Promise<boolean>;
    listAllPickupRequests(): Promise<Array<PickupRequestPublic>>;
    listComplaints(): Promise<Array<ComplaintPublic>>;
    listDriverProfiles(): Promise<Array<DriverProfilePublic>>;
    listDriverStates(): Promise<Array<DriverStatePublic>>;
    listMyPickupRequests(): Promise<Array<PickupRequestPublic>>;
    listMyTips(): Promise<Array<TipPublic>>;
    listPendingPickupRequests(): Promise<Array<PickupRequestPublic>>;
    listVehicles(): Promise<Array<VehiclePublic>>;
    markThreadRead(senderId: UserId): Promise<void>;
    register(role: Role, displayName: string): Promise<RegisterResult>;
    sendMessage(receiverId: UserId, text: string): Promise<bigint>;
    setDutyStatus(status: DutyStatus): Promise<void>;
    setFillPercent(percent: bigint): Promise<void>;
    submitComplaint(input: SubmitComplaintInput): Promise<bigint>;
    submitTip(input: SubmitTipInput): Promise<bigint>;
    unreadMessageCount(senderId: UserId): Promise<bigint>;
    updateLocation(latitude: number, longitude: number, active: boolean): Promise<void>;
    updatePickupStatus(requestId: bigint, status: PickupStatus): Promise<boolean>;
    upsertDriverProfile(name: string, age: bigint, phone: string, bloodGroup: string, address: string, photoKey: string | null): Promise<void>;
}
