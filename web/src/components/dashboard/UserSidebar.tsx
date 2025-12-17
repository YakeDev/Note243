"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  HomeModernIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { title?: string; titleId?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: HomeModernIcon },
  { href: "/dashboard#reviews", label: "Mes avis", icon: ChatBubbleLeftRightIcon },
  { href: "/dashboard#favorites", label: "Mes favoris", icon: HeartIcon },
  { href: "/dashboard/settings", label: "Paramètres du compte", icon: AdjustmentsHorizontalIcon },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === pathname || (item.href === "/dashboard" && pathname === "/dashboard");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-primary/5",
                isActive ? "bg-primary/10 text-primary" : "text-slate-800",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="my-3 h-px bg-slate-200" />
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        <ArrowRightIcon className="h-5 w-5" />
        Déconnexion
      </button>
    </aside>
  );
}
