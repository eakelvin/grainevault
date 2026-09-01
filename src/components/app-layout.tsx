"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/types";
import { useApp } from "@/context/app-context";
import {
  LayoutGrid,
  Mail,
  Settings,
  Users,
  LogOut,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: routes.vault, label: "Vault", icon: LayoutGrid },
  { href: routes.digest, label: "Weekly Digest", icon: Mail },
  { href: routes.board, label: "Board", icon: Users },
  { href: routes.settings, label: "Settings", icon: Settings },
] as const;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, sidebarOpen, setSidebarOpen } = useApp();

  const isActive = (href: string) => {
    if (href === routes.vault) {
      return pathname === href || pathname.startsWith("/ideas");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    router.push(routes.home);
    router.refresh();
  };

  const sidebarContent = (
    <>
      <Link href={routes.vault} className="flex items-center gap-2.5 px-2 py-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">Ideas Vault</p>
          <p className="text-xs text-slate-400">Research on autopilot</p>
        </div>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
      >
        <LogOut className="h-5 w-5" />
        Log Out
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-700/60 bg-slate-900/50 p-5 backdrop-blur-sm md:flex">
        {sidebarContent}
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
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-white">Ideas Vault</span>
          </div>
          <div className="w-9" />
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
