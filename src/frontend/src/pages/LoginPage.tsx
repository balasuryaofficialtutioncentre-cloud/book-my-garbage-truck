import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Truck, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const ROLES: {
  id: Role;
  label: string;
  description: string;
  color: string;
  icon: string;
}[] = [
  {
    id: "owner",
    label: "Fleet Owner",
    description:
      "Manage your vehicles, monitor drivers, and track fleet performance",
    color: "border-[oklch(0.42_0.09_189)] bg-[oklch(0.42_0.09_189/0.08)]",
    icon: "🏢",
  },
  {
    id: "driver",
    label: "Driver",
    description:
      "Manage routes, update waste fill levels, and accept pickup requests",
    color: "border-[oklch(0.48_0.12_142)] bg-[oklch(0.48_0.12_142/0.08)]",
    icon: "🚛",
  },
  {
    id: "customer",
    label: "Public / Customer",
    description: "Request pickups, track trucks live, and contact support",
    color: "border-[oklch(0.42_0.08_240)] bg-[oklch(0.42_0.08_240/0.08)]",
    icon: "🏠",
  },
];

export function LoginPage() {
  const { isAuthenticated, isLoading, role, login, register, isRegistering } =
    useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated with a role
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "owner") navigate({ to: "/owner" });
      else if (role === "driver") navigate({ to: "/driver" });
      else navigate({ to: "/public" });
    } else if (isAuthenticated && !isLoading && role === null) {
      setShowRoleSelect(true);
    }
  }, [isAuthenticated, role, isLoading, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch {
      // login error handled by hook
    }
  };

  const handleRegister = async () => {
    if (!selectedRole) return;
    try {
      await register(selectedRole);
    } catch {
      // handled by hook
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero header */}
      <div className="bg-[oklch(0.22_0.08_160)] text-[oklch(0.95_0_0)] px-4 pt-12 pb-8 flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="size-16 rounded-2xl bg-white/15 flex items-center justify-center shadow-elevated"
        >
          <Truck className="size-9 text-white" />
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="font-display font-bold text-2xl leading-tight text-white">
            Book My Garbage Truck
          </h1>
          <p className="text-sm opacity-75 mt-1 text-white/80">
            Smart. Safe. Sustainable waste management.
          </p>
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex gap-2 flex-wrap justify-center"
        >
          <Badge className="bg-white/15 text-white border-0 text-xs">
            📍 Live Tracking
          </Badge>
          <Badge className="bg-white/15 text-white border-0 text-xs">
            💬 In-App Chat
          </Badge>
          <Badge className="bg-white/15 text-white border-0 text-xs">
            🔒 Safe & Private
          </Badge>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {isLoading ? (
          <div
            className="flex flex-col items-center gap-4 py-12"
            data-ocid="login-loading"
          >
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Connecting securely…
            </p>
          </div>
        ) : !isAuthenticated ? (
          /* Not logged in */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <div className="text-center mb-2">
              <h2 className="font-display font-semibold text-xl">
                Sign In to Continue
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Secure sign-in powered by Internet Identity
              </p>
            </div>

            {/* Features */}
            <Card className="card-elevated">
              <CardContent className="p-4 space-y-3">
                {[
                  {
                    id: "gps",
                    icon: "🚛",
                    text: "Real-time GPS truck tracking",
                  },
                  {
                    id: "chat",
                    icon: "💬",
                    text: "Secure in-app chat & calls",
                  },
                  { id: "pickup", icon: "♻️", text: "Request & manage pickups" },
                  { id: "safety", icon: "🛡️", text: "Women's safety helpline" },
                ].map((f) => (
                  <div key={f.id} className="flex items-center gap-3 text-sm">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-foreground">{f.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full gap-2 font-semibold"
              onClick={handleLogin}
              data-ocid="login-btn"
            >
              <ShieldCheck className="size-5" />
              Sign In with Internet Identity
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your identity is secured using cryptographic keys — no passwords
              needed.
            </p>
          </motion.div>
        ) : showRoleSelect ? (
          /* Role selection */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div className="text-center">
              <UserCheck className="size-8 text-primary mx-auto mb-2" />
              <h2 className="font-display font-semibold text-xl">
                Choose Your Role
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select how you'll use Book My Garbage Truck
              </p>
            </div>

            <div className="space-y-3" data-ocid="role-select">
              {ROLES.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-smooth ${
                      selectedRole === r.id
                        ? `${r.color} shadow-elevated`
                        : "border-border bg-card hover:border-border/60 hover:bg-muted/20"
                    }`}
                    data-ocid={`role-option-${r.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground">
                          {r.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {r.description}
                        </div>
                      </div>
                      {selectedRole === r.id && (
                        <div className="ml-auto text-primary">✓</div>
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full font-semibold"
              disabled={!selectedRole || isRegistering}
              onClick={handleRegister}
              data-ocid="register-btn"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Setting up account…
                </>
              ) : (
                `Continue as ${selectedRole ? ROLES.find((r) => r.id === selectedRole)?.label : "…"}`
              )}
            </Button>
          </motion.div>
        ) : null}
      </div>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-4 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80 transition-smooth"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
