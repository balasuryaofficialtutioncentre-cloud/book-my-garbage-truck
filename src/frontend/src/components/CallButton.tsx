import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, PhoneCall, X } from "lucide-react";
import { useState } from "react";

interface CallButtonProps {
  /** Phone number to call */
  phoneNumber: string;
  /** Display label for the recipient */
  label: string;
  /** If true, shows number display but routes call through app (for driver privacy) */
  routeThroughApp?: boolean;
  /** Visual variant */
  variant?: "default" | "destructive" | "outline" | "ghost";
  /** Size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Extra className */
  className?: string;
  /** Show the number as text next to the button */
  showNumber?: boolean;
  /** Full-width emergency style */
  emergency?: boolean;
}

export function CallButton({
  phoneNumber,
  label,
  routeThroughApp = false,
  variant = "default",
  size = "default",
  className = "",
  showNumber = false,
  emergency = false,
}: CallButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleCallClick = () => {
    if (routeThroughApp) {
      // Show in-app calling UI (not a direct dial)
      setConfirmOpen(true);
    } else {
      setConfirmOpen(true);
    }
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    // In production with routeThroughApp, this would open in-app call
    // For now, use tel: for non-private numbers
    if (!routeThroughApp) {
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, "")}`;
    } else {
      // Simulate in-app call routing (placeholder for future WebRTC integration)
      setPermissionDenied(false);
    }
  };

  if (emergency) {
    return (
      <>
        <a
          href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
          className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 bg-destructive text-destructive-foreground font-semibold shadow-elevated hover:opacity-90 transition-smooth no-underline ${className}`}
          data-ocid="call-emergency"
          aria-label={`Emergency call ${label}`}
        >
          <div className="size-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Phone className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider opacity-90">
              {label}
            </div>
            <div className="text-lg font-bold font-mono">{phoneNumber}</div>
          </div>
        </a>
        {permissionDenied && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <AlertTriangle className="size-3" /> Call permission required
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Button
          variant={variant}
          size={size}
          onClick={handleCallClick}
          className="gap-2"
          data-ocid="call-btn"
          aria-label={`Call ${label}`}
        >
          <Phone className="size-4" />
          {size !== "icon" && "Call"}
        </Button>
        {showNumber && (
          <span className="text-sm font-mono text-muted-foreground">
            {phoneNumber}
          </span>
        )}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-ocid="call-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PhoneCall className="size-5 text-primary" />
              {routeThroughApp ? "Connect Call" : `Call ${label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {routeThroughApp
                ? `This call will be routed through the app to protect the driver's privacy. You'll be connected to ${label}.`
                : `You are about to call ${label} at ${phoneNumber}. This will open your phone's dialer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="call-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} data-ocid="call-confirm">
              {routeThroughApp ? "Connect" : "Call Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {permissionDenied && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <X className="size-3" /> Unable to initiate call
        </p>
      )}
    </>
  );
}
