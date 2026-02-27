"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenSquare,
  BookOpenText,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    title: "Écrire",
    href: "/sanctuary/write",
    icon: PenSquare,
    description: "Nouvelle page",
  },
  {
    title: "Journal",
    href: "/sanctuary",
    icon: BookOpenText,
    description: "Tes entrées",
  },
  {
    title: "Magazine",
    href: "/sanctuary/magazine",
    icon: BarChart3,
    description: "Profils & progression",
  },
  {
    title: "Insights",
    href: "/insights",
    icon: Sparkles,
    description: "Clarté guidée",
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
    description: "Compte & données",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  if (!mounted) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "relative hidden lg:flex h-screen flex-col border-r border-border/40 bg-stone-950/5 text-stone-900 transition-all duration-300 ease-in-out z-40 overflow-hidden",
        isCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Logo Area */}
      <div className="p-6 mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-stone-50 shadow-lg">
            <span className="text-xl font-bold font-headline">A</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold font-headline text-xl tracking-tight"
              >
                Aurum
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {!isCollapsed && (
          <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                title={item.title}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "bg-stone-900 text-stone-50 shadow-md"
                    : "text-stone-600 hover:bg-stone-900/5 hover:text-stone-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-stone-50"
                      : "text-stone-400 group-hover:text-stone-900"
                  )}
                />

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col overflow-hidden"
                    >
                      <span className="font-semibold text-sm leading-none">
                        {item.title}
                      </span>
                      {item.description && (
                        <span
                          className={cn(
                            "text-[10px] mt-1 uppercase tracking-widest opacity-60 font-medium",
                            isActive ? "text-stone-400" : "text-stone-500"
                          )}
                        >
                          {item.description}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isActive && (
                  <>
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-amber-500 rounded-full"
                    />
                    {!isCollapsed && (
                      <span className="ml-auto rounded-full bg-stone-50/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-100">
                        Ici
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 space-y-2 border-t border-border/40">
        {user ? (
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-semibold text-sm">Déconnexion</span>
            )}
          </button>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-900/5 hover:text-stone-900 transition-all duration-200"
          >
            <LogIn className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm">Connexion</span>}
          </Link>
        )}

        {/* User Info (Mini) */}
        {!isCollapsed && user && (
          <div className="mt-4 px-4 py-3 rounded-2xl bg-white/50 border border-border/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={(user.displayName ?? "") || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user.displayName ?? "").charAt(0) || "U"
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate text-stone-900">
                  {(user.displayName ?? "") || "Utilisateur"}
                </span>
                <span className="text-[10px] text-stone-500 truncate">
                  Membre Aurum
                </span>
              </div>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="mt-2 px-4 py-2 rounded-xl border border-stone-200/70 bg-white/40">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500 font-semibold">
              Astuce
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
              2 minutes d&apos;écriture valent mieux qu&apos;une longue session reportée.
            </p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute bottom-24 -right-3 h-6 w-6 rounded-full border border-border bg-white shadow-sm flex items-center justify-center hover:bg-stone-50 transition-colors z-50 lg:flex hidden"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
