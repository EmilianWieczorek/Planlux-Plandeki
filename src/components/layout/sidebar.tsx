import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Factory, Tag, Warehouse, Paperclip, Shield } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Klienci", icon: Users },
  { href: "/orders", label: "Zamówienia", icon: ClipboardList },
  { href: "/production", label: "Produkcja", icon: Factory },
  { href: "/labels", label: "Etykiety", icon: Tag },
  { href: "/warehouse", label: "Magazyn", icon: Warehouse }
  // Attachments module (/attachments) is not yet implemented.
  // When the module is ready, re‑enable:
  // { href: "/attachments", label: "Załączniki", icon: Paperclip }
];

interface SidebarProps {
  role?: "admin" | "manager" | "foreman" | null;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-4 text-lg font-semibold tracking-tight">
        PLANLUX
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          PRODUKCJA PLANDEK
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {role === "admin" && (
          <Link
            href="/admin"
            className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <Shield className="h-4 w-4" />
            <span>Administracja</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}

