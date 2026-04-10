import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import type { Role } from "@/types";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, LogOut, Truck, User } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  userRole?: Role;
}

const ROLE_CONFIG: Record<
  Role,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  owner: {
    label: "Owner",
    bg: "bg-[oklch(0.28_0.09_189)]",
    border: "border-[oklch(0.35_0.09_189)]",
    text: "text-[oklch(0.95_0_0)]",
    dot: "bg-[oklch(0.75_0.12_189)]",
  },
  driver: {
    label: "Driver",
    bg: "bg-[oklch(0.26_0.09_142)]",
    border: "border-[oklch(0.33_0.09_142)]",
    text: "text-[oklch(0.95_0_0)]",
    dot: "bg-[oklch(0.72_0.14_142)]",
  },
  customer: {
    label: "Public",
    bg: "bg-[oklch(0.26_0.08_240)]",
    border: "border-[oklch(0.33_0.08_240)]",
    text: "text-[oklch(0.95_0_0)]",
    dot: "bg-[oklch(0.72_0.10_240)]",
  },
};

export function Layout({ children, userRole }: LayoutProps) {
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const config = userRole ? ROLE_CONFIG[userRole] : null;

  const headerClass = config
    ? `${config.bg} ${config.border} border-b`
    : "bg-card border-b border-border";

  const headerText = config ? config.text : "text-foreground";

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className={`${headerClass} sticky top-0 z-50 shadow-elevated`}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Brand */}
          <Link
            to="/"
            className={`flex items-center gap-2 ${headerText} no-underline`}
          >
            <div className="p-1.5 rounded-lg bg-white/15">
              <Truck className="size-5" />
            </div>
            <div className="min-w-0">
              <div
                className={`font-display font-bold text-sm leading-tight truncate ${headerText}`}
              >
                Book My Garbage Truck
              </div>
              {config && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`size-1.5 rounded-full ${config.dot}`} />
                  <span className={`text-xs opacity-80 ${headerText}`}>
                    {config.label} View
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Actions */}
          {!isLoginPage && isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${headerText} hover:bg-white/15 relative`}
                  aria-label="Notifications"
                  data-ocid="nav-notifications"
                >
                  <Bell className="size-5" />
                </Button>
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[9px] bg-accent text-accent-foreground border-0">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </div>

              {/* Profile */}
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${headerText} hover:bg-white/15`}
                  aria-label="Account"
                  data-ocid="nav-account"
                >
                  <User className="size-5" />
                </Button>
              </Link>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                className={`${headerText} hover:bg-white/15`}
                onClick={logout}
                aria-label="Sign out"
                data-ocid="nav-logout"
              >
                <LogOut className="size-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background">{children}</main>

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
