import { CallButton } from "@/components/CallButton";
import { ChatButton } from "@/components/ChatModal";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { useGps } from "@/hooks/useGps";
import type {
  ComplaintCategory,
  DriverProfile,
  DriverState,
  PickupRequest,
  PickupStatus,
  Role,
  TipProvider,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Fuel,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: PickupStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-accent/20 text-accent-foreground border-accent/40 border">
          Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/40 border">
          Accepted
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/30 border">
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-muted text-muted-foreground border">
          Cancelled
        </Badge>
      );
  }
}

function FillBar({ percent }: { percent: number }) {
  const color =
    percent >= 80
      ? "bg-destructive"
      : percent >= 50
        ? "bg-accent"
        : "bg-secondary";
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

// ─── section: live driver tracking ──────────────────────────────────────────

interface DriverCardProps {
  state: DriverState;
  profile?: DriverProfile;
}

function DriverCard({ state, profile }: DriverCardProps) {
  const isActive = state.dutyStatus === "onDuty";
  return (
    <Card className="card-elevated" data-ocid="driver-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Truck className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-foreground truncate text-sm">
                {profile?.name ?? `Driver ${state.driverId.slice(0, 6)}`}
              </p>
              <Badge
                className={`text-[10px] flex-shrink-0 ${isActive ? "bg-secondary/20 text-secondary-foreground border-secondary/40 border" : "bg-muted text-muted-foreground border"}`}
              >
                {isActive ? "● Active" : "Inactive"}
              </Badge>
            </div>
            {profile?.vehicleNumber && (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {profile.vehicleNumber}
              </p>
            )}
            <div className="mt-2 space-y-1.5">
              {/* Location */}
              {state.lat !== undefined && state.lon !== undefined ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3 flex-shrink-0" />
                  <span className="font-mono">
                    {state.lat.toFixed(4)}, {state.lon.toFixed(4)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Navigation className="size-3" />
                  <span>Location not shared</span>
                </div>
              )}
              {/* Fill level */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Trash2 className="size-3" /> Waste Level
                  </span>
                  <span className="font-semibold">{state.fillPercent}%</span>
                </div>
                <FillBar percent={state.fillPercent} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── section: request pickup ─────────────────────────────────────────────────

function RequestPickupSection() {
  const { actor, isReady } = useBackend();
  const { coords, permission, requestLocation } = useGps();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [wasteType, setWasteType] = useState("Household waste");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not ready");
      await (
        actor as unknown as {
          createPickupRequest: (
            address: string,
            wasteType: string,
            lat: number | null,
            lon: number | null,
          ) => Promise<unknown>;
        }
      ).createPickupRequest(
        address,
        wasteType,
        coords?.lat ?? null,
        coords?.lon ?? null,
      );
    },
    onSuccess: () => {
      setSuccess(true);
      setAddress("");
      queryClient.invalidateQueries({ queryKey: ["myPickupRequests"] });
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: () => {
      toast.error("Failed to submit request. Please try again.");
    },
  });

  return (
    <Card className="card-elevated" data-ocid="pickup-request-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          Request Pickup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary-foreground text-sm">
            <CheckCircle2 className="size-4 flex-shrink-0" />
            <span>Pickup request submitted! Drivers will be notified.</span>
          </div>
        )}

        {/* GPS pre-fill */}
        {coords ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg border border-border">
            <MapPin className="size-3 text-secondary flex-shrink-0" />
            <span className="font-mono">
              Location: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
            </span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={requestLocation}
            disabled={permission === "unavailable" || permission === "denied"}
            data-ocid="get-location-btn"
          >
            <Navigation className="size-4" />
            {permission === "denied"
              ? "Location denied"
              : "Use my current location"}
          </Button>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="address-input" className="text-xs font-medium">
            Address / Landmark
          </Label>
          <Input
            id="address-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 12, MG Road, Near Café Corner"
            className="text-sm"
            data-ocid="pickup-address-input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="waste-type" className="text-xs font-medium">
            Waste Type
          </Label>
          <Select value={wasteType} onValueChange={setWasteType}>
            <SelectTrigger
              id="waste-type"
              className="text-sm"
              data-ocid="waste-type-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Household waste">Household waste</SelectItem>
              <SelectItem value="Dry waste">Dry waste (recyclable)</SelectItem>
              <SelectItem value="Wet waste">Wet waste (organic)</SelectItem>
              <SelectItem value="Bulk waste">Bulk / large items</SelectItem>
              <SelectItem value="Construction debris">
                Construction debris
              </SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          disabled={!address.trim() || !isReady || mutation.isPending}
          onClick={() => mutation.mutate()}
          data-ocid="submit-pickup-btn"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="size-4 mr-2" />
          )}
          Request Pickup
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── section: my requests ────────────────────────────────────────────────────

function MyRequestsSection() {
  const { actor, isReady } = useBackend();

  const { data: requests = [], isLoading } = useQuery<PickupRequest[]>({
    queryKey: ["myPickupRequests"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (
          actor as unknown as {
            listMyPickupRequests: () => Promise<PickupRequest[]>;
          }
        ).listMyPickupRequests();
        return result;
      } catch {
        return [];
      }
    },
    enabled: isReady,
    refetchInterval: 15000,
  });

  return (
    <Card className="card-elevated" data-ocid="my-requests-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          My Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-6 text-center"
            data-ocid="requests-empty-state"
          >
            <Truck className="size-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">
              No pickup requests yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Request one above to get started.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-3 pr-1">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-border bg-background p-3 space-y-2"
                  data-ocid="request-row"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {req.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.wasteType}
                      </p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                  {req.driverId && (
                    <div className="flex items-center gap-2">
                      <ChatButton
                        peerId={req.driverId}
                        peerName="Assigned Driver"
                        className="flex-1"
                      />
                      <CallButton
                        phoneNumber={req.driverId}
                        label="Assigned Driver"
                        routeThroughApp
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// ─── section: helpline ───────────────────────────────────────────────────────

function HelplineSection() {
  return (
    <Card className="card-elevated" data-ocid="helpline-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="size-4 text-primary" />
          Need Help?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Women's Helpline — safety red, prominent */}
        <a
          href="tel:1091"
          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 bg-destructive text-destructive-foreground font-semibold shadow-sm hover:opacity-90 transition-smooth no-underline"
          data-ocid="womens-helpline-btn"
          aria-label="Call Women's Safety Helpline 1091"
        >
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Phone className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">
              Women's Safety Helpline
            </div>
            <div className="text-xl font-bold font-mono leading-tight">
              1091
            </div>
            <div className="text-[10px] opacity-80 mt-0.5">
              For women in distress — 24/7
            </div>
          </div>
        </a>

        {/* General Helpline */}
        <a
          href="tel:+911800-180-5555"
          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 transition-smooth no-underline"
          data-ocid="general-helpline-btn"
          aria-label="Call General Helpline"
        >
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Phone className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">
              Customer Support
            </div>
            <div className="text-base font-bold font-mono leading-tight">
              1800-180-5555
            </div>
            <div className="text-[10px] opacity-80 mt-0.5">
              Toll-free · Mon–Sat 8am–8pm
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  );
}

// ─── section: smart pay tip ──────────────────────────────────────────────────

const TIP_PROVIDERS: {
  id: TipProvider;
  label: string;
  deepLink: string;
  color: string;
}[] = [
  {
    id: "phonePe",
    label: "PhonePe",
    deepLink: "phonepe://pay",
    color: "bg-[oklch(0.42_0.14_289)] text-[oklch(0.98_0_0)]",
  },
  {
    id: "gPay",
    label: "GPay",
    deepLink: "tez://upi/pay",
    color: "bg-[oklch(0.52_0.18_142)] text-[oklch(0.98_0_0)]",
  },
  {
    id: "paytm",
    label: "Paytm",
    deepLink: "paytmmp://pay",
    color: "bg-[oklch(0.48_0.18_216)] text-[oklch(0.98_0_0)]",
  },
  {
    id: "postOfficeSavings",
    label: "Post Office",
    deepLink: "https://www.indiapost.gov.in",
    color: "bg-accent text-accent-foreground",
  },
];

function SmartPaySection({ driverId }: { driverId?: string }) {
  const { actor, isReady } = useBackend();
  const [tipSuccess, setTipSuccess] = useState(false);
  const queryClient = useQueryClient();

  const tipMutation = useMutation({
    mutationFn: async (provider: TipProvider) => {
      if (!actor) throw new Error("Not ready");
      await (
        actor as unknown as {
          submitTip: (
            driverId: string,
            amount: number,
            provider: unknown,
          ) => Promise<unknown>;
        }
      ).submitTip(driverId ?? "general", 1, { [provider]: null });
    },
    onSuccess: () => {
      setTipSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["myTips"] });
      setTimeout(() => setTipSuccess(false), 6000);
    },
    onError: () => {
      toast.error("Could not record tip. Please try again.");
    },
  });

  const handleTip = (provider: TipProvider, deepLink: string) => {
    tipMutation.mutate(provider);
    // Open the payment app
    window.location.href = deepLink;
  };

  return (
    <Card className="card-elevated" data-ocid="smart-pay-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Fuel className="size-4 text-primary" />
          Tip Your Driver
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Appreciate the hard work — send a tip via Smart Pay
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tipSuccess && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary-foreground text-sm"
            data-ocid="tip-success-msg"
          >
            <CheckCircle2 className="size-4 flex-shrink-0" />
            <span>
              🙏 Thank you for your generosity! Your tip has been sent.
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {TIP_PROVIDERS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => handleTip(p.id, p.deepLink)}
              disabled={!isReady || tipMutation.isPending}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 px-2 text-sm font-semibold transition-smooth hover:opacity-90 active:scale-95 disabled:opacity-50 ${p.color}`}
              data-ocid={`tip-btn-${p.id}`}
              aria-label={`Tip via ${p.label}`}
            >
              {tipMutation.isPending && tipMutation.variables === p.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {p.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── section: complaint form ─────────────────────────────────────────────────

function ComplaintSection() {
  const { actor, isReady } = useBackend();
  const [category, setCategory] = useState<ComplaintCategory>("missedPickup");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not ready");
      await (
        actor as unknown as {
          submitComplaint: (
            driverId: string | null,
            category: unknown,
            description: string,
          ) => Promise<unknown>;
        }
      ).submitComplaint(null, { [category]: null }, description);
    },
    onSuccess: () => {
      setSubmitted(true);
      setDescription("");
      setCategory("missedPickup");
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: () => {
      toast.error("Failed to submit complaint. Please try again.");
    },
  });

  const categoryLabels: Record<ComplaintCategory, string> = {
    missedPickup: "Missed Pickup",
    driverBehavior: "Driver Behavior",
    vehicleCondition: "Vehicle Condition",
    other: "Other",
  };

  return (
    <Card className="card-elevated" data-ocid="complaint-section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="size-4 text-primary" />
          Submit a Complaint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {submitted && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary-foreground text-sm">
            <CheckCircle2 className="size-4 flex-shrink-0" />
            <span>Complaint submitted. We'll look into it shortly.</span>
          </div>
        )}
        <div className="space-y-1.5">
          <Label
            htmlFor="complaint-category-select"
            className="text-xs font-medium"
          >
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ComplaintCategory)}
          >
            <SelectTrigger
              id="complaint-category-select"
              className="text-sm"
              data-ocid="complaint-category"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(categoryLabels) as ComplaintCategory[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {categoryLabels[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail…"
            rows={3}
            className="text-sm resize-none"
            data-ocid="complaint-description"
          />
        </div>
        <Button
          className="w-full"
          disabled={!description.trim() || !isReady || mutation.isPending}
          onClick={() => mutation.mutate()}
          data-ocid="complaint-submit-btn"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <XCircle className="size-4 mr-2" />
          )}
          Submit Complaint
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── section: live driver list ────────────────────────────────────────────────

function LiveDriversSection() {
  const { actor, isReady } = useBackend();

  const { data: driverStates = [], isLoading: statesLoading } = useQuery<
    DriverState[]
  >({
    queryKey: ["driverStates"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (
          actor as unknown as {
            listDriverStates: () => Promise<DriverState[]>;
          }
        ).listDriverStates();
        return result;
      } catch {
        return [];
      }
    },
    enabled: isReady,
    refetchInterval: 10000,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<
    DriverProfile[]
  >({
    queryKey: ["driverProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (
          actor as unknown as {
            listDriverProfiles: () => Promise<DriverProfile[]>;
          }
        ).listDriverProfiles();
        return result;
      } catch {
        return [];
      }
    },
    enabled: isReady,
    staleTime: 60_000,
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const isLoading = statesLoading || profilesLoading;

  return (
    <section className="space-y-3" data-ocid="live-drivers-section">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground">
          Live Trucks
        </h2>
        <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/40 border text-xs">
          {driverStates.filter((s) => s.dutyStatus === "onDuty").length} active
        </Badge>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : driverStates.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="py-8 text-center">
            <Truck className="size-10 text-muted-foreground opacity-30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              No trucks on duty right now
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back during collection hours
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {driverStates.map((state) => (
            <DriverCard
              key={state.driverId}
              state={state}
              profile={profileMap.get(state.driverId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export function PublicPage() {
  const { isAuthenticated } = useAuth();
  const layoutProps = { userRole: "customer" as Role };

  // Section tabs for mobile navigation
  const SECTIONS = [
    { id: "tracking", label: "Tracking", icon: Truck },
    { id: "request", label: "Request", icon: MapPin },
    { id: "requests", label: "My Jobs", icon: Clock },
    { id: "helpline", label: "Helpline", icon: Phone },
    { id: "tip", label: "Tip", icon: Fuel },
  ] as const;

  type SectionId = (typeof SECTIONS)[number]["id"];
  const [activeSection, setActiveSection] = useState<SectionId>("tracking");

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Layout {...layoutProps}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
          <Truck className="size-12 text-primary opacity-60" />
          <h2 className="font-display text-xl font-bold">
            Book My Garbage Truck
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Track trucks, request pickups, and access emergency helplines.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout {...layoutProps}>
      {/* Section content */}
      <div className="px-4 pt-4 pb-24 space-y-4 max-w-lg mx-auto">
        {activeSection === "tracking" && <LiveDriversSection />}
        {activeSection === "request" && <RequestPickupSection />}
        {activeSection === "requests" && <MyRequestsSection />}
        {activeSection === "helpline" && <HelplineSection />}
        {activeSection === "tip" && <SmartPaySection />}

        {/* Always show complaint in tracking/requests/tip sections */}
        {(activeSection === "tracking" ||
          activeSection === "requests" ||
          activeSection === "tip") && <ComplaintSection />}
      </div>

      {/* Bottom navigation bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
        data-ocid="bottom-nav"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            const isHelpline = id === "helpline";
            return (
              <button
                type="button"
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-smooth min-w-0 flex-1 ${
                  isActive
                    ? isHelpline
                      ? "text-destructive"
                      : "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`nav-tab-${id}`}
                aria-label={label}
              >
                <Icon
                  className={`size-5 ${isActive && !isHelpline ? "text-primary" : isActive && isHelpline ? "text-destructive" : ""}`}
                />
                <span
                  className={`text-[10px] font-medium truncate ${isActive && isHelpline ? "text-destructive font-bold" : ""}`}
                >
                  {label}
                </span>
                {isActive && (
                  <span
                    className={`size-1 rounded-full ${isHelpline ? "bg-destructive" : "bg-primary"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
