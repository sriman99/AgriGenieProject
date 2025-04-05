import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  LineChart,
  Settings,
  FileText,
  BellRing,
  Package,
  Upload,
  FilePlus,
  ShoppingBag,
  Store,
  List,
  Truck,
  Grid,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NavLink } from "./nav-link";
import { usePathname } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { profile } = useAuth();
  const userType = profile?.user_type;
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <NavLink href="/dashboard" icon={<Home />}>
              Overview
            </NavLink>
            <NavLink href="/dashboard/analytics" icon={<LineChart />}>
              Analytics
            </NavLink>
            {userType === "farmer" && (
              <>
                <NavLink href="/dashboard/farm-records" icon={<FileText />}>
                  Farm Records
                </NavLink>
                <NavLink href="/dashboard/alerts" icon={<BellRing />}>
                  Alerts & Advisories
                </NavLink>
              </>
            )}
            {userType === "buyer" && (
              <NavLink href="/dashboard/purchases" icon={<Package />}>
                Purchase History
              </NavLink>
            )}
          </div>
        </div>
        <Separator />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Marketplace
          </h2>
          <div className="space-y-1">
            <NavLink href="/marketplace" icon={<Store />}>
              Browse Marketplace
            </NavLink>
            {userType === "farmer" && (
              <>
                <NavLink href="/dashboard/farmer/listings" icon={<List />}>
                  My Listings
                </NavLink>
                <NavLink href="/marketplace/new" icon={<FilePlus />}>
                  Create Listing
                </NavLink>
                <NavLink href="/dashboard/farmer/orders" icon={<Truck />}>
                  Manage Orders
                </NavLink>
              </>
            )}
            {userType === "buyer" && (
              <NavLink href="/dashboard/buyer/orders" icon={<ShoppingBag />}>
                My Orders
              </NavLink>
            )}
          </div>
        </div>
        <Separator />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Tools
          </h2>
          <div className="space-y-1">
            <NavLink href={isHomePage ? "#features" : "/features"} icon={<Grid />}>
              Features
            </NavLink>
            {userType === "farmer" && (
              <NavLink href="/dashboard/crop-analysis" icon={<Upload />}>
                Crop Analysis
              </NavLink>
            )}
            <NavLink href="/dashboard/settings" icon={<Settings />}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
} 