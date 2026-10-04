"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/types";
import { useApp } from "@/context/app-context";
import {
  LayoutGrid,
  Mail,
  Users,
  X,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatarMenu, useCurrentUser } from "@/components/auth/user-avatar-menu";
import { BrandLogo } from "@/components/brand-logo";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_COLLAPSED_KEY = "ideas-vault-sidebar-collapsed";

const navItems = [
  { href: routes.vault, label: "Vault", icon: LayoutGrid },
  // { href: routes.archive, label: "Archive", icon: Archive },
  { href: routes.digest, label: "Weekly Digest", icon: Mail },
  { href: routes.board, label: "Board", icon: Users },
] as const;

interface AppLayoutProps {
  children: React.ReactNode;
}

interface SidebarBodyProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

function SidebarBody({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
}: SidebarBodyProps) {
  const pathname = usePathname();
  const user = useCurrentUser();

  const isActive = (href: string) => {
    if (href === routes.vault) {
      return pathname === href || pathname.startsWith("/ideas");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div
        className={cn(
          "flex gap-1",
          collapsed ? "flex-col items-center" : "items-center justify-between"
        )}
      >
        <Link
          href={routes.vault}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 py-1",
            collapsed ? "justify-center px-0" : "min-w-0 flex-1 px-2"
          )}
        >
          <BrandLogo
            size={36}
            withWordmark={!collapsed}
            subtitle={collapsed ? undefined : "Research on autopilot"}
          />
        </Link>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="shrink-0 text-slate-400 hover:text-white"
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            aria-label={label}
            onClick={onNavigate}
            className={cn(
              "flex w-full min-w-0 items-center overflow-hidden rounded-xl py-2.5 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2 min-h-10" : "gap-3 px-3",
              isActive(href)
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className={cn(collapsed && "flex justify-center")}>
        <UserAvatarMenu
          compact={collapsed}
          user={user}
          menuSide={collapsed ? "right" : undefined}
          menuAlign={collapsed ? "start" : undefined}
        />
      </div>
    </>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useApp();
  const user = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === routes.vault) {
      return pathname === href || pathname.startsWith("/ideas");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "b") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      setCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
        return next;
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <aside
        id="app-sidebar"
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden border-r border-slate-700/60 bg-slate-900/50 py-5 backdrop-blur-sm transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[72px] min-w-[72px] px-2" : "w-64 min-w-64 px-5"
        )}
      >
        <SidebarBody collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-700/60 bg-slate-900 p-5 md:hidden"
            >
              <div className="mb-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarBody onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <BrandLogo size={28} />
          <UserAvatarMenu compact user={user} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-700/60 bg-slate-900/95 px-2 py-2 backdrop-blur-md md:hidden">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                isActive(href)
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-[4.5rem] truncate">
                {label.split(" ")[0]}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
