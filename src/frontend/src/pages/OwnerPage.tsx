import { CallButton } from "@/components/CallButton";
import { ChatButton } from "@/components/ChatModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import type { DriverProfile, DriverState, Vehicle } from "@/types";
import {
  AlertTriangle,
  Car,
  Clock,
  Loader2,
  MapPin,
  Trash2,
  Truck,
  User,
  Users,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

// ─── Mock data for demo (real app populates from actor) ────────────────────────
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    vehicleNumber: "MH-04-AB-1234",
    model: "Tata Ace",
    capacity: 2000,
    assignedDriverId: "d1",
  },
  {
    id: "v2",
    vehicleNumber: "MH-04-CD-5678",
    model: "Mahindra Bolero",
    capacity: 3000,
    assignedDriverId: "d2",
  },
  {
    id: "v3",
    vehicleNumber: "MH-04-EF-9012",
    model: "Eicher Pro",
    capacity: 5000,
    assignedDriverId: "d3",
  },
  {
    id: "v4",
    vehicleNumber: "MH-04-GH-3456",
    model: "Tata 407",
    capacity: 4000,
  },
];

const MOCK_PROFILES: DriverProfile[] = [
  {
    id: "d1",
    name: "Rajesh Kumar",
    age: 34,
    phone: "+91 98765 43210",
    bloodGroup: "B+",
    address: "14, Laxmi Nagar, Pune - 411001",
    photoUrl: "",
    vehicleNumber: "MH-04-AB-1234",
    licenseNumber: "MH0420180023456",
  },
  {
    id: "d2",
    name: "Suresh Patil",
    age: 41,
    phone: "+91 87654 32109",
    bloodGroup: "O+",
    address: "7, Ganesh Peth, Pune - 411002",
    photoUrl: "",
    vehicleNumber: "MH-04-CD-5678",
    licenseNumber: "MH0420150015678",
  },
  {
    id: "d3",
    name: "Anil Singh",
    age: 29,
    phone: "+91 76543 21098",
    bloodGroup: "A+",
    address: "23, Shivaji Nagar, Pune - 411005",
    photoUrl: "",
    vehicleNumber: "MH-04-EF-9012",
    licenseNumber: "MH0420200034567",
  },
];

const MOCK_STATES: DriverState[] = [
  {
    driverId: "d1",
    dutyStatus: "onDuty",
    fillPercent: 75,
    lat: 18.5204,
    lon: 73.8567,
    lastUpdated: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    driverId: "d2",
    dutyStatus: "onDuty",
    fillPercent: 48,
    lat: 18.5314,
    lon: 73.8446,
    lastUpdated: BigInt(Date.now() - 2 * 60 * 1000) * BigInt(1_000_000),
  },
  {
    driverId: "d3",
    dutyStatus: "offDuty",
    fillPercent: 22,
    lat: undefined,
    lon: undefined,
    lastUpdated: BigInt(Date.now() - 15 * 60 * 1000) * BigInt(1_000_000),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fillColor(pct: number) {
  if (pct >= 80) return "bg-destructive";
  if (pct >= 50) return "bg-[oklch(0.72_0.18_80)]";
  return "bg-[oklch(0.52_0.14_142)]";
}

function fillLabel(pct: number) {
  if (pct >= 80) return "Critical";
  if (pct >= 50) return "Moderate";
  return "Low";
}

function fillLabelColor(pct: number) {
  if (pct >= 80) return "text-destructive";
  if (pct >= 50) return "text-[oklch(0.58_0.18_80)]";
  return "text-[oklch(0.42_0.14_142)]";
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  return `${Math.floor(diff / 3_600_000)} hr ago`;
}

function DriverAvatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="w-full h-full rounded-full bg-[oklch(0.42_0.08_189)] flex items-center justify-center">
      <span className="text-white font-bold text-sm">{initials}</span>
    </div>
  );
}

// ─── Driver Detail Modal ───────────────────────────────────────────────────────
interface DriverDetailModalProps {
  vehicle: Vehicle | null;
  profile: DriverProfile | null;
  state: DriverState | null;
  open: boolean;
  onClose: () => void;
  onAssign: (vehicleId: string, driverId: string) => void;
}

function DriverDetailModal({
  vehicle,
  profile,
  state,
  open,
  onClose,
  onAssign,
}: DriverDetailModalProps) {
  if (!vehicle) return null;

  const fill = state?.fillPercent ?? 0;
  const assigned = profile;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        data-ocid="driver-detail-modal"
      >
        {/* Modal header */}
        <div
          className="px-4 py-4"
          style={{ background: "oklch(0.38 0.10 189)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white font-display text-base font-semibold flex items-center gap-2">
              <Truck className="size-4" />
              {vehicle.vehicleNumber}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/70 text-xs mt-0.5">{vehicle.model}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Driver photo + info */}
          {assigned ? (
            <div className="flex items-start gap-4">
              {/* Compulsory driver photo */}
              <div className="size-20 rounded-xl overflow-hidden border-2 border-border flex-shrink-0 bg-muted">
                <DriverAvatar
                  photoUrl={assigned.photoUrl}
                  name={assigned.name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg text-foreground truncate">
                  {assigned.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={
                      state?.dutyStatus === "onDuty"
                        ? "bg-[oklch(0.48_0.12_142)] text-white border-0 text-xs"
                        : "bg-muted text-muted-foreground border-0 text-xs"
                    }
                  >
                    {state?.dutyStatus === "onDuty"
                      ? "● On Duty"
                      : "● Off Duty"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-dashed border-border">
              <User className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No driver assigned
                </p>
                <p className="text-xs text-muted-foreground">
                  Use dropdown below to assign
                </p>
              </div>
            </div>
          )}

          {/* Driver details table */}
          {assigned && (
            <div className="rounded-xl border border-border overflow-hidden">
              {[
                {
                  icon: <User className="size-3.5" />,
                  label: "Age",
                  value: `${assigned.age} years`,
                },
                {
                  icon: <span className="text-[11px] font-bold">🩸</span>,
                  label: "Blood Group",
                  value: assigned.bloodGroup,
                },
                {
                  icon: <MapPin className="size-3.5" />,
                  label: "Address",
                  value: assigned.address,
                },
                {
                  icon: <Car className="size-3.5" />,
                  label: "License",
                  value: assigned.licenseNumber ?? "N/A",
                },
              ].map(({ icon, label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-start gap-3 px-3 py-2.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="text-muted-foreground mt-0.5 flex-shrink-0">
                    {icon}
                  </span>
                  <span className="text-xs text-muted-foreground w-20 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-xs font-medium text-foreground flex-1 min-w-0 break-words">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Waste fill */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Trash2 className="size-3.5" /> Waste Fill
              </span>
              <span className={`text-xs font-bold ${fillLabelColor(fill)}`}>
                {fill}% — {fillLabel(fill)}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fillColor(fill)}`}
                style={{ width: `${fill}%` }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* GPS location */}
          {state?.lat !== undefined && state?.lon !== undefined ? (
            <div className="rounded-xl border border-border px-3 py-2.5 space-y-1">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[oklch(0.42_0.08_189)]" />
                GPS Location
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {state.lat.toFixed(6)}, {state.lon.toFixed(6)}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                Last seen: {formatTimestamp(state.lastUpdated)}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-3 py-2.5 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5" />
              <span className="text-xs">GPS not active</span>
            </div>
          )}

          {/* Action buttons */}
          {assigned && (
            <div className="flex gap-2">
              <CallButton
                phoneNumber={assigned.phone}
                label={assigned.name}
                variant="default"
                size="sm"
                className="flex-1"
              />
              <ChatButton
                peerId={assigned.id}
                peerName={assigned.name}
                className="flex-1"
              />
            </div>
          )}

          {/* Assign driver */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">
              Assign Driver
            </p>
            <Select
              defaultValue={assigned?.id ?? ""}
              onValueChange={(driverId) => onAssign(vehicle.id, driverId)}
            >
              <SelectTrigger
                className="h-9 text-xs"
                data-ocid="assign-driver-select"
              >
                <SelectValue placeholder="Select a driver…" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PROFILES.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vehicle Card ──────────────────────────────────────────────────────────────
interface VehicleCardProps {
  vehicle: Vehicle;
  profile?: DriverProfile;
  state?: DriverState;
  onClick: () => void;
}

function VehicleCard({ vehicle, profile, state, onClick }: VehicleCardProps) {
  const fill = state?.fillPercent ?? 0;
  const isOnDuty = state?.dutyStatus === "onDuty";

  return (
    <Card
      className="card-elevated cursor-pointer active:scale-[0.98] transition-smooth"
      onClick={onClick}
      data-ocid="vehicle-card"
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Driver photo thumbnail */}
          <div className="size-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0 bg-muted">
            {profile ? (
              <DriverAvatar photoUrl={profile.photoUrl} name={profile.name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm font-bold text-foreground font-mono truncate">
                {vehicle.vehicleNumber}
              </span>
              <Badge
                className={`text-[10px] font-semibold px-2 py-0.5 border-0 flex-shrink-0 ${
                  isOnDuty
                    ? "bg-[oklch(0.48_0.12_142)] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                data-ocid="duty-badge"
              >
                {isOnDuty ? "On Duty" : "Off Duty"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {profile ? profile.name : "Unassigned"} · {vehicle.model}
            </p>
          </div>
        </div>

        {/* Fill bar */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Trash2 className="size-3" /> Waste Fill
            </span>
            <span
              className={`text-[10px] font-semibold ${fillLabelColor(fill)}`}
            >
              {fill}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${fillColor(fill)}`}
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>

        {/* GPS last seen */}
        {state && (
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="size-3" />
            {formatTimestamp(state.lastUpdated)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({
  total,
  active,
  avgFill,
}: {
  total: number;
  active: number;
  avgFill: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 pb-4">
      {[
        { label: "Total Trucks", value: `${active}/${total}`, sub: "Active" },
        {
          label: "Avg Fill",
          value: `${Math.round(avgFill)}%`,
          sub: "Fleet load",
        },
        { label: "On Duty", value: active, sub: "Drivers" },
      ].map(({ label, value, sub }) => (
        <div
          key={label}
          className="bg-white/15 rounded-xl px-3 py-2.5 text-center"
        >
          <p className="text-lg font-bold text-white leading-none">{value}</p>
          <p className="text-white/70 text-[10px] mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OwnerPage() {
  useAuth();
  const { actor, isReady } = useBackend();

  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [profiles, setProfiles] = useState<DriverProfile[]>(MOCK_PROFILES);
  const [states, setStates] = useState<DriverState[]>(MOCK_STATES);
  const [loading, setLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch from backend when ready
  const fetchData = useCallback(async () => {
    if (!actor || !isReady) return;
    try {
      setLoading(true);
      const [vList, pList, sList] = await Promise.all([
        (
          actor as unknown as { listVehicles: () => Promise<Vehicle[]> }
        ).listVehicles(),
        (
          actor as unknown as {
            listDriverProfiles: () => Promise<DriverProfile[]>;
          }
        ).listDriverProfiles(),
        (
          actor as unknown as { listDriverStates: () => Promise<DriverState[]> }
        ).listDriverStates(),
      ]);
      if (vList?.length) setVehicles(vList);
      if (pList?.length) setProfiles(pList);
      if (sList?.length) setStates(sList);
    } catch {
      // fallback to mock data already set
    } finally {
      setLoading(false);
    }
  }, [actor, isReady]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ?? null;
  const selectedProfile = selectedVehicle?.assignedDriverId
    ? (profiles.find((p) => p.id === selectedVehicle.assignedDriverId) ?? null)
    : null;
  const selectedState = selectedProfile
    ? (states.find((s) => s.driverId === selectedProfile.id) ?? null)
    : null;

  const activeCount = states.filter((s) => s.dutyStatus === "onDuty").length;
  const avgFill =
    states.length > 0
      ? states.reduce((sum, s) => sum + s.fillPercent, 0) / states.length
      : 0;

  const handleCardClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setDetailOpen(true);
  };

  const handleAssign = async (vehicleId: string, driverId: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, assignedDriverId: driverId } : v,
      ),
    );
    try {
      if (actor && isReady) {
        await (
          actor as unknown as {
            assignVehicle: (
              vehicleId: string,
              driverId: string,
            ) => Promise<unknown>;
          }
        ).assignVehicle(vehicleId, driverId);
      }
    } catch {
      // silent — optimistic update stays
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Teal header */}
      <header
        className="pb-2"
        style={{ background: "oklch(0.38 0.10 189)" }}
        data-ocid="owner-header"
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Truck className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-white leading-none">
                Book My Garbage Truck
              </h1>
              <p className="text-white/70 text-[10px] mt-0.5">
                Owner Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <Loader2 className="size-4 text-white/70 animate-spin" />
            )}
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="size-5 text-white" />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar
          total={vehicles.length}
          active={activeCount}
          avgFill={avgFill}
        />
      </header>

      {/* Fleet list */}
      <main className="flex-1 px-4 py-4 space-y-3" data-ocid="fleet-list">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-semibold text-foreground text-sm">
            Fleet Overview
          </h2>
          <span className="text-xs text-muted-foreground">
            {vehicles.length} vehicles
          </span>
        </div>

        {loading && vehicles.length === 0 ? (
          ["skel-a", "skel-b", "skel-c"].map((k) => (
            <Skeleton key={k} className="h-24 w-full rounded-xl" />
          ))
        ) : vehicles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 text-center"
            data-ocid="fleet-empty"
          >
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
              <Truck className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No vehicles yet
            </p>
            <p className="text-xs text-muted-foreground">
              Add vehicles from the management panel
            </p>
          </div>
        ) : (
          vehicles.map((vehicle) => {
            const profile = vehicle.assignedDriverId
              ? profiles.find((p) => p.id === vehicle.assignedDriverId)
              : undefined;
            const driverState = profile
              ? states.find((s) => s.driverId === profile.id)
              : undefined;

            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                profile={profile}
                state={driverState}
                onClick={() => handleCardClick(vehicle.id)}
              />
            );
          })
        )}

        {/* Alert for high fill trucks */}
        {states.some((s) => s.fillPercent >= 80) && (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3 mt-4"
            data-ocid="fill-alert"
          >
            <AlertTriangle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-destructive">
                High Fill Alert
              </p>
              <p className="text-xs text-muted-foreground">
                {states.filter((s) => s.fillPercent >= 80).length} truck(s) at
                critical capacity. Dispatch immediately.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border px-4 py-3 text-center">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Driver detail modal */}
      <DriverDetailModal
        vehicle={selectedVehicle}
        profile={selectedProfile}
        state={selectedState}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  );
}
