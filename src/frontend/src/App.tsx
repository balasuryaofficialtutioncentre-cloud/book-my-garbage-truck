import { DriverPage } from "@/pages/DriverPage";
import { LoginPage } from "@/pages/LoginPage";
import OwnerPage from "@/pages/OwnerPage";
import { PublicPage } from "@/pages/PublicPage";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  Outlet,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Owner route
const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/owner",
  component: OwnerPage,
});

// Driver route
const driverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver",
  component: DriverPage,
});

// Public route
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/public",
  component: PublicPage,
});

// Index route — redirect to login
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  ownerRoute,
  driverRoute,
  publicRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
