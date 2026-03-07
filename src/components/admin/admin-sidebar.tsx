"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ShoppingCart,
  BookOpen,
  Award,
  Users,
  Settings,
  CreditCard,
  Globe,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Áttekintés",
    items: [
      { title: "Kezelőpult", href: "/admin", icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    label: "Shop modul",
    items: [
      { title: "Termékek", href: "/admin/products", icon: <ShoppingBag size={20} /> },
      { title: "Kategóriák", href: "/admin/categories", icon: <Tags size={20} /> },
      { title: "Rendelések", href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    ],
  },
  {
    label: "LMS modul",
    items: [
      { title: "Kurzusok", href: "/admin/courses", icon: <BookOpen size={20} /> },
      { title: "Vizsgák", href: "/admin/exams", icon: <Award size={20} /> },
      { title: "Felhasználók", href: "/admin/users", icon: <Users size={20} /> },
    ],
  },
  {
    label: "Beállítások",
    items: [
      { title: "Stripe", href: "/admin/stripe", icon: <CreditCard size={20} /> },
      { title: "Fordítások", href: "/admin/translations", icon: <Globe size={20} /> },
      { title: "Általános", href: "/admin/settings", icon: <Settings size={20} /> },
    ],
  },
];

export function AdminSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-admin-bg border-r border-white/5 py-6">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold font-mono tracking-tighter text-white">
          HHM<span className="text-brand-orange">Admin</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-8">
        {sidebarGroups.map((group, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold px-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={j}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-brand-orange/10 text-brand-orange font-medium border-l-4 border-brand-orange"
                        : "text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                    }`}
                  >
                    <span className={isActive ? "text-brand-orange" : "text-white/50"}>
                      {item.icon}
                    </span>
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="mt-auto px-6 pt-6 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Adminisztrátor</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
            className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            title="Kijelentkezés"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Opcionális asztali burkoló
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0">
      <AdminSidebarContent />
    </aside>
  );
}
