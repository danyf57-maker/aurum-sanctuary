"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenSquare,
  BookOpenText,
  BarChart3,
  Settings,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LanguageSwitch } from "./language-switch";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { stripLocalePrefix } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const NAV_ITEMS = [
  { key: "write",     descKey: "writeDesc",     href: "/sanctuary/write", icon: PenSquare },
  { key: "journal",   descKey: "journalDesc",   href: "/sanctuary", icon: BookOpenText },
  { key: "magazine",  descKey: "magazineDesc",  href: "/sanctuary/magazine", icon: BarChart3 },
  { key: "dashboard", descKey: "dashboardDesc", href: "/dashboard", icon: LayoutDashboard },
  { key: "settings",  descKey: "settingsDesc",  href: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const normalizedPath = stripLocalePrefix(pathname || "/");
  const to = useLocalizedHref();
  const { user, logout } = useAuth();
  const t = useTranslations("nav");
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

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return normalizedPath === "/dashboard";
    if (href === "/sanctuary") return normalizedPath === "/sanctuary";
    return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "relative hidden lg:flex h-screen flex-col border-r border-stone-200/80 bg-gradient-to-b from-stone-50 to-white text-stone-900 transition-all duration-300 ease-in-out z-40 overflow-hidden",
        isCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Logo Area */}
      <div className="p-6 mb-6">
        <Link href={to("/")} className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-stone-50 shadow-md shadow-stone-900/15">
            <span className="text-xl font-bold font-headline">A</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold font-headline text-[34px] tracking-tight leading-none"
              >
                Aurum
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {!isCollapsed && (
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-stone-500/90">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(item.href);
          return (
            <Link key={item.href} href={to(item.href)}>
              <div
                title={t(item.key)}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 relative border",
                  isActive
                    ? "bg-white text-stone-900 border-amber-200/80 shadow-sm shadow-stone-900/5"
                    : "text-stone-600 border-transparent hover:border-stone-200/70 hover:bg-white/75 hover:text-stone-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-amber-600"
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
                        {t(item.key)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] mt-1 uppercase tracking-[0.14em] opacity-70 font-medium",
                          isActive ? "text-stone-500" : "text-stone-500/90"
                        )}
                      >
                        {t(item.descKey)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isActive && (
                  <>
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-7 bg-amber-500 rounded-full"
                    />
                    {!isCollapsed && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-amber-500" aria-hidden>
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
      <div className="p-4 space-y-2 border-t border-stone-200/80 bg-white/50">
        {user ? (
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-semibold text-sm">{t("signOut")}</span>
            )}
          </button>
        ) : (
          <Link
            href={to("/login")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-900/5 hover:text-stone-900 transition-all duration-200"
          >
            <LogIn className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm">{t("signIn")}</span>}
          </Link>
        )}

        {/* User Info (Mini) */}
        {!isCollapsed && user && (
          <div className="mt-4 px-4 py-3 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 overflow-hidden">
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
                <span className="text-base font-semibold truncate text-stone-900 leading-none">
                  {(user.displayName ?? "") || t("user")}
                </span>
                <span className="text-xs text-stone-500 truncate mt-1">
                  {t("memberAurum")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={cn("pt-1 pb-1", isCollapsed ? "px-2" : "px-4")}>
          <LanguageSwitch compact className="w-full justify-center" />
        </div>

        {!isCollapsed && (
          <div className="mt-2 px-4 py-3 rounded-xl border border-amber-200/70 bg-amber-50/50">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500 font-semibold">
              {t("tip")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              {t("tipText")}
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
