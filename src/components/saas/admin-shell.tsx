import Link from "next/link";
import { LayoutDashboard, List, Receipt, Settings, Users, WalletCards } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/generations", label: "Generations", Icon: List },
  { href: "/admin/orders", label: "Orders", Icon: Receipt },
  { href: "/admin/plans", label: "Plans", Icon: WalletCards },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
  { href: "/admin/audit-logs", label: "Audit logs", Icon: List },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-lg border bg-white p-3 shadow-sm lg:sticky lg:top-20 lg:h-fit">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Admin
        </p>
        <nav className="grid gap-1">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </main>
  );
}
