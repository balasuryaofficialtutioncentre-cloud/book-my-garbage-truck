import { CallButton } from "@/components/CallButton";
import { ChatButton, ChatModal } from "@/components/ChatModal";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { useGps } from "@/hooks/useGps";
import { useMessages } from "@/hooks/useMessages";
import type { PickupRequest, Tip, TipProvider } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  MapPin,
  MessageCircle,
  Navigation,
  Power,
  RefreshCw,
  Satellite,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Provider brand colours ────────────────────────────────────────────────────
const PROVIDER_META: Record<
  TipProvider,
  { label: string; color: string; bg: string }
> = {
  phonePe: {
    label: "PhonePe",
    color: "text-[oklch(0.45_0.22_298)]",
    bg: "bg-[oklch(0.95_0.04_298)]",
  },
  gPay: {
    label: "GPay",
    color: "text-[oklch(0.40_0.18_240)]",
    bg: "bg-[oklch(0.95_0.04_240)]",
  },
  paytm: {
    label: "Paytm",
    color: "text-[oklch(0.42_0.18_215)]",
    bg: "bg-[oklch(0.95_0.04_215)]",
  },
  postOfficeSavings: {
    label: "Post Office",
    color: "text-[oklch(0.42_0.20_27)]",
    bg: "bg-[oklch(0.96_0.04_27)]",
  },
  other: {
    label: "Other",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

// ── Fill-bar colour thresholds ────────────────────────────────────────────────
function fillColor(pct: number): string {
  if (pct < 40) return "bg-[oklch(0.55_0.18_142)]";
  if (pct < 75) return "bg-[oklch(0.65_0.18_65)]";
  return "bg-[oklch(0.52_0.22_27)]";
}

// ── Sample / seed data (shown until backend responds) ────────────────────────
const SEED_REQUESTS: PickupRequest[] = [
  {
    id: "req-1",
    customerId: "cust-1",
    address: "12 Gandhi Nagar, Block B",
    wasteType: "Mixed Household",
    status: "pending",
    lat: 19.076,
    lon: 72.8777,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "req-2",
    customerId: "cust-2",
    address: "Sector 4, Andheri East",
    wasteType: "E-Waste",
    status: "pending",
    lat: 19.082,
    lon: 72.869,
    createdAt: BigInt(Date.now() * 1_000_000 - 300_000_000_000),
  },
];

const SEED_TIPS: Tip[] = [
  {
    id: "tip-1",
    fromCustomerId: "Priya S.",
    toDriverId: "me",
    amount: 50,
    provider: "phonePe",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: "tip-2",
    fromCustomerId: "Rahul M.",
    toDriverId: "me",
    amount: 20,
    provider: "gPay",
    createdAt: BigInt(Date.now() * 1_000_000 - 3_600_000_000_000),
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-4 bg-card">
        <CardTitle className="text-base font-display flex items-center gap-2 text-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-4 py-3">{children}</CardContent>
    </Card>
  );
}

function TipCard({ tip, isNew }: { tip: Tip; isNew: boolean }) {
  const meta = PROVIDER_META[tip.provider];
  const timeAgo = (() => {
    const ms = Date.now() - Number(tip.createdAt) / 1_000_000;
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  })();

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-smooth ${meta.bg} ${isNew ? "ring-2 ring-[oklch(0.55_0.18_142)]" : ""}`}
      data-ocid="tip-card"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`size-9 rounded-full flex items-center justify-center shrink-0 bg-white/60 ${meta.color} font-bold text-xs`}
        >
          {meta.label.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">
            {tip.fromCustomerId}
          </p>
          <p className={`text-xs ${meta.color} font-medium`}>{meta.label}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className="font-bold text-foreground text-sm">₹{tip.amount}</p>
        <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

interface ConversationRowProps {
  peerId: string;
  peerName: string;
  subtitle: string;
}
function ConversationRow({ peerId, peerName, subtitle }: ConversationRowProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useMessages(peerId);

  return (
    <>
      <div
        className="rounded-xl px-3 py-2.5 bg-muted/40 hover:bg-muted transition-smooth space-y-2"
        data-ocid="conversation-row"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between text-left"
          aria-label={`Open chat with ${peerName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-full bg-[oklch(0.26_0.09_142)] flex items-center justify-center text-[oklch(0.95_0_0)] shrink-0">
              <MessageCircle className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {peerName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge className="shrink-0 bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
              {unreadCount}
            </Badge>
          )}
        </button>
        <div className="flex gap-2">
          <ChatButton peerId={peerId} peerName={peerName} className="flex-1" />
          <CallButton
            phoneNumber={peerId}
            label={peerName}
            routeThroughApp
            variant="outline"
            size="sm"
            className="flex-1"
          />
        </div>
      </div>
      <ChatModal
        peerId={peerId}
        peerName={peerName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function DriverPage() {
  const { actor, isReady } = useBackend();
  const { coords, permission, isTracking, startTracking, stopTracking } =
    useGps();

  // Duty state
  const [onDuty, setOnDuty] = useState(false);
  const [dutyLoading, setDutyLoading] = useState(false);

  // Fill percent
  const [fillPercent, setFillPercent] = useState(0);
  const [fillSubmitting, setFillSubmitting] = useState(false);

  // Pickup requests
  const [pendingRequests, setPendingRequests] =
    useState<PickupRequest[]>(SEED_REQUESTS);
  const [acceptedRequests, setAcceptedRequests] = useState<PickupRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Tips
  const [tips, setTips] = useState<Tip[]>(SEED_TIPS);
  const [newTipIds, setNewTipIds] = useState<Set<string>>(new Set());
  const prevTipIdsRef = useRef<Set<string>>(
    new Set(SEED_TIPS.map((t) => t.id)),
  );

  // ── Load driver state + requests ──────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !actor) return;
    const load = async () => {
      setRequestsLoading(true);
      try {
        const actorAny = actor as unknown as {
          getDriverState: () => Promise<{
            dutyStatus: { onDuty?: unknown };
            fillPercent: bigint;
          } | null>;
          listPendingPickupRequests: () => Promise<PickupRequest[]>;
          listMyTips: () => Promise<Tip[]>;
        };

        const [stateRes, reqRes, tipRes] = await Promise.all([
          actorAny.getDriverState().catch(() => null),
          actorAny.listPendingPickupRequests().catch(() => []),
          actorAny.listMyTips().catch(() => []),
        ]);

        if (stateRes) {
          setOnDuty("onDuty" in stateRes.dutyStatus);
          setFillPercent(Number(stateRes.fillPercent));
        }
        if (reqRes.length > 0) {
          setPendingRequests(reqRes.filter((r) => r.status === "pending"));
          setAcceptedRequests(reqRes.filter((r) => r.status === "accepted"));
        }
        if (tipRes.length > 0) {
          setTips(tipRes);
          const incoming = new Set<string>();
          for (const t of tipRes) {
            if (!prevTipIdsRef.current.has(t.id)) incoming.add(t.id);
          }
          if (incoming.size > 0) {
            setNewTipIds(incoming);
            toast.success(
              `💚 You received ${incoming.size} new tip(s)! Thank you!`,
              {
                duration: 5000,
              },
            );
          }
          prevTipIdsRef.current = new Set(tipRes.map((t) => t.id));
        }
      } finally {
        setRequestsLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [isReady, actor]);

  // ── Send GPS location every 30s ────────────────────────────────────────────
  useEffect(() => {
    if (!isTracking || !coords || !isReady || !actor) return;
    const send = async () => {
      try {
        await (
          actor as unknown as {
            updateLocation: (lat: number, lon: number) => Promise<unknown>;
          }
        ).updateLocation(coords.lat, coords.lon);
      } catch {
        /* silent */
      }
    };
    send();
    const interval = setInterval(send, 30000);
    return () => clearInterval(interval);
  }, [isTracking, coords, isReady, actor]);

  // ── Toggle duty ───────────────────────────────────────────────────────────
  const toggleDuty = useCallback(async () => {
    setDutyLoading(true);
    const next = !onDuty;
    try {
      if (actor) {
        await (
          actor as unknown as {
            setDutyStatus: (
              status: { onDuty?: null } | { offDuty?: null },
            ) => Promise<unknown>;
          }
        ).setDutyStatus(next ? { onDuty: null } : { offDuty: null });
      }
      setOnDuty(next);
      toast.success(
        next ? "Duty started — stay safe! 🚛" : "Duty ended. Good work today!",
      );
    } catch {
      toast.error("Could not update duty status. Please retry.");
    } finally {
      setDutyLoading(false);
    }
  }, [onDuty, actor]);

  // ── GPS toggle ────────────────────────────────────────────────────────────
  const handleGpsToggle = useCallback(() => {
    if (isTracking) {
      stopTracking();
      toast("GPS tracking stopped.");
    } else {
      startTracking();
      toast("GPS activated — sharing your location.");
    }
  }, [isTracking, startTracking, stopTracking]);

  // ── Submit fill percent ───────────────────────────────────────────────────
  const submitFill = useCallback(async () => {
    if (!actor) {
      toast.error("Not connected to backend.");
      return;
    }
    setFillSubmitting(true);
    try {
      await (
        actor as unknown as {
          setFillPercent: (pct: number) => Promise<unknown>;
        }
      ).setFillPercent(fillPercent);
      toast.success(`Fill level set to ${fillPercent}%`);
    } catch {
      toast.error("Failed to update fill level.");
    } finally {
      setFillSubmitting(false);
    }
  }, [actor, fillPercent]);

  // ── Accept pickup request ─────────────────────────────────────────────────
  const acceptRequest = useCallback(
    async (req: PickupRequest) => {
      if (actor) {
        try {
          await (
            actor as unknown as {
              acceptPickupRequest: (id: string) => Promise<unknown>;
            }
          ).acceptPickupRequest(req.id);
        } catch {
          /* optimistic */
        }
      }
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
      setAcceptedRequests((prev) => [...prev, { ...req, status: "accepted" }]);
      toast.success("Pickup accepted!");
    },
    [actor],
  );

  // ── Reject pickup request ─────────────────────────────────────────────────
  const rejectRequest = useCallback(
    async (req: PickupRequest) => {
      if (actor) {
        try {
          await (
            actor as unknown as {
              updatePickupStatus: (
                id: string,
                status: { cancelled?: null },
              ) => Promise<unknown>;
            }
          ).updatePickupStatus(req.id, { cancelled: null });
        } catch {
          /* optimistic */
        }
      }
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast("Request declined.");
    },
    [actor],
  );

  // ── Mark pickup complete ──────────────────────────────────────────────────
  const completeRequest = useCallback(
    async (req: PickupRequest) => {
      if (actor) {
        try {
          await (
            actor as unknown as {
              updatePickupStatus: (
                id: string,
                status: { completed?: null },
              ) => Promise<unknown>;
            }
          ).updatePickupStatus(req.id, { completed: null });
        } catch {
          /* optimistic */
        }
      }
      setAcceptedRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.success("Pickup marked complete ✅");
    },
    [actor],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout userRole="driver">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* ── Duty Toggle ── */}
        <Card
          className={`overflow-hidden transition-smooth ${
            onDuty
              ? "bg-[oklch(0.26_0.09_142)] border-[oklch(0.33_0.09_142)]"
              : "bg-card border-border"
          }`}
          data-ocid="duty-toggle-card"
        >
          <CardContent className="px-4 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className={`font-display font-bold text-lg leading-tight truncate ${
                  onDuty ? "text-[oklch(0.97_0_0)]" : "text-foreground"
                }`}
              >
                {onDuty ? "On Duty" : "Off Duty"}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  onDuty
                    ? "text-[oklch(0.85_0.06_142)]"
                    : "text-muted-foreground"
                }`}
              >
                {onDuty
                  ? "GPS & pickups are active"
                  : "Tap to begin your shift"}
              </p>
            </div>
            <Button
              onClick={toggleDuty}
              disabled={dutyLoading}
              size="lg"
              className={`shrink-0 gap-2 font-semibold transition-smooth ${
                onDuty
                  ? "bg-white/20 hover:bg-white/30 text-[oklch(0.97_0_0)] border border-white/30"
                  : "bg-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.38_0.16_142)] text-[oklch(0.97_0_0)]"
              }`}
              data-ocid="duty-toggle-btn"
            >
              {dutyLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Power className="size-4" />
              )}
              {onDuty ? "End Duty" : "Start Duty"}
            </Button>
          </CardContent>
        </Card>

        {/* ── GPS Section ── */}
        <SectionCard
          title="GPS Tracking"
          icon={<Satellite className="size-4 text-[oklch(0.48_0.16_142)]" />}
        >
          <div className="space-y-3">
            {permission === "unavailable" && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <WifiOff className="size-4 shrink-0" />
                GPS is not supported on this device.
              </div>
            )}
            {permission === "denied" && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertTriangle className="size-4 shrink-0" />
                Location access denied. Please enable in browser settings.
              </div>
            )}

            <Button
              onClick={handleGpsToggle}
              disabled={permission === "unavailable" || permission === "denied"}
              className={`w-full gap-2 font-semibold transition-smooth ${
                isTracking
                  ? "bg-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.38_0.16_142)] text-[oklch(0.97_0_0)]"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
              data-ocid="gps-toggle-btn"
            >
              <Navigation
                className={`size-4 ${isTracking ? "animate-pulse" : ""}`}
              />
              {isTracking ? "Disable GPS" : "Enable GPS"}
              {isTracking && (
                <span className="ml-auto flex items-center gap-1 text-[oklch(0.80_0.10_142)] text-xs font-normal">
                  <span className="size-1.5 rounded-full bg-[oklch(0.80_0.14_142)] animate-pulse" />
                  Live
                </span>
              )}
            </Button>

            {isTracking && coords && (
              <div className="flex gap-2 text-xs">
                <div className="flex-1 rounded-lg bg-muted/60 px-3 py-2">
                  <p className="text-muted-foreground mb-0.5">Latitude</p>
                  <p className="font-mono font-medium text-foreground">
                    {coords.lat.toFixed(6)}
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-muted/60 px-3 py-2">
                  <p className="text-muted-foreground mb-0.5">Longitude</p>
                  <p className="font-mono font-medium text-foreground">
                    {coords.lon.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
            {isTracking && (
              <p className="text-[10px] text-muted-foreground text-center">
                Location sent to backend every 30 seconds
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Waste Fill Slider ── */}
        <SectionCard
          title="Waste Fill Level"
          icon={<Trash2 className="size-4 text-[oklch(0.52_0.18_65)]" />}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current load</span>
              <span
                className={`font-bold text-base ${
                  fillPercent < 40
                    ? "text-[oklch(0.45_0.18_142)]"
                    : fillPercent < 75
                      ? "text-[oklch(0.52_0.18_65)]"
                      : "text-destructive"
                }`}
              >
                {fillPercent}%
              </span>
            </div>

            {/* Custom coloured progress bar + range input */}
            <div className="relative">
              <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-smooth ${fillColor(fillPercent)}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={fillPercent}
                onChange={(e) => setFillPercent(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Waste fill percentage"
                data-ocid="fill-slider"
              />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Empty</span>
              <span>Half</span>
              <span>Full</span>
            </div>

            <Button
              onClick={submitFill}
              disabled={fillSubmitting || !isReady}
              className="w-full bg-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.38_0.16_142)] text-[oklch(0.97_0_0)] font-semibold gap-2"
              data-ocid="fill-submit-btn"
            >
              {fillSubmitting ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Cpu className="size-4" />
              )}
              Update Fill Level
            </Button>
          </div>
        </SectionCard>

        {/* ── Pending Pickup Requests ── */}
        <SectionCard
          title={`Pending Requests (${pendingRequests.length})`}
          icon={<Clock className="size-4 text-[oklch(0.52_0.18_65)]" />}
        >
          {requestsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2 text-center">
              <CheckCircle2 className="size-8 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                No pending requests
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-border bg-background px-3 py-3 space-y-2"
                  data-ocid="pickup-request-row"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-[oklch(0.42_0.16_142)] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {req.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.wasteType}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptRequest(req)}
                      className="flex-1 bg-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.38_0.16_142)] text-[oklch(0.97_0_0)] font-semibold"
                      data-ocid="pickup-accept-btn"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRequest(req)}
                      className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/10"
                      data-ocid="pickup-reject-btn"
                    >
                      <X className="size-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Accepted Requests ── */}
        {acceptedRequests.length > 0 && (
          <SectionCard
            title={`Active Pickups (${acceptedRequests.length})`}
            icon={<Navigation className="size-4 text-[oklch(0.42_0.16_142)]" />}
          >
            <div className="space-y-2">
              {acceptedRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-[oklch(0.42_0.16_142)]/30 bg-[oklch(0.97_0.02_142)] px-3 py-3 space-y-2"
                  data-ocid="accepted-request-row"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-[oklch(0.42_0.16_142)] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {req.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.wasteType}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => completeRequest(req)}
                      className="flex-1 bg-[oklch(0.42_0.16_142)] hover:bg-[oklch(0.38_0.16_142)] text-[oklch(0.97_0_0)] font-semibold"
                      data-ocid="pickup-complete-btn"
                    >
                      <CheckCircle2 className="size-3 mr-1.5" />
                      Mark Complete
                    </Button>
                    <ChatButton
                      peerId={req.customerId}
                      peerName={`Customer (${req.address.split(",")[0]})`}
                    />
                    <CallButton
                      phoneNumber={req.customerId}
                      label={`Customer (${req.address.split(",")[0]})`}
                      routeThroughApp
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Messages ── */}
        <SectionCard
          title="Messages"
          icon={
            <MessageCircle className="size-4 text-[oklch(0.42_0.08_189)]" />
          }
        >
          <div className="space-y-2">
            <ConversationRow
              peerId="owner-principal"
              peerName="Fleet Owner"
              subtitle="Tap to chat with your manager"
            />
            {acceptedRequests.map((req) => (
              <ConversationRow
                key={req.id}
                peerId={req.customerId}
                peerName={`Customer — ${req.address.split(",")[0]}`}
                subtitle={req.wasteType}
              />
            ))}
            {acceptedRequests.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Accept a pickup to chat with that customer
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Smart Pay Tips ── */}
        <SectionCard
          title="Smart Pay Tips"
          icon={<DollarSign className="size-4 text-[oklch(0.48_0.16_142)]" />}
        >
          {tips.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2 text-center">
              <DollarSign className="size-8 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                No tips received yet
              </p>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tips.map((tip) => (
                <TipCard key={tip.id} tip={tip} isNew={newTipIds.has(tip.id)} />
              ))}
              <p className="text-xs text-center text-muted-foreground pt-1">
                Total received:{" "}
                <span className="font-semibold text-foreground">
                  ₹{tips.reduce((s, t) => s + t.amount, 0)}
                </span>
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </Layout>
  );
}
