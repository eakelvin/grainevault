"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { LayoutGrid, LogOut, Settings, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/context/app-context";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/types";
import { getUserDisplayName, getUserInitials } from "@/lib/helpers/user-display";
import { cn } from "@/lib/utils";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}

interface UserAvatarMenuProps {
  compact?: boolean;
  user: User | null | undefined;
  menuSide?: "top" | "bottom" | "left" | "right";
  menuAlign?: "start" | "center" | "end";
}

export function UserAvatarMenu({
  compact = false,
  user,
  menuSide,
  menuAlign,
}: UserAvatarMenuProps) {
  const router = useRouter();
  const { setSidebarOpen } = useApp();

  const goTo = (href: string) => {
    setSidebarOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(routes.home);
    router.refresh();
  };

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);
  const itemClassName =
    "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none select-none data-highlighted:bg-slate-700 data-highlighted:text-white";

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        aria-label="Account menu"
        className={cn(
          "rounded-full text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400",
          compact
            ? "hover:opacity-90"
            : "flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-800 data-popup-open:bg-slate-800"
        )}
      >
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
            {displayName}
          </span>
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className="z-[60] outline-none"
          side={menuSide ?? (compact ? "bottom" : "top")}
          align={menuAlign ?? (compact ? "end" : "start")}
          sideOffset={8}
        >
          <Menu.Popup className="min-w-56 origin-[var(--transform-origin)] rounded-xl border border-slate-700/60 bg-slate-800 p-1 text-slate-200 shadow-xl outline-none">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                )}
              </div>
            </div>
            {compact && (
              <Menu.Item
                onClick={() => goTo(routes.vault)}
                className={itemClassName}
              >
                <LayoutGrid className="h-4 w-4" />
                Open vault
              </Menu.Item>
            )}
            <Menu.Item
              onClick={() => goTo(routes.profile)}
              className={itemClassName}
            >
              <UserRound className="h-4 w-4" />
              Profile
            </Menu.Item>
            <Menu.Item
              onClick={() => goTo(routes.settings)}
              className={itemClassName}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Menu.Item>
            <Menu.Item onClick={handleLogout} className={itemClassName}>
              <LogOut className="h-4 w-4" />
              Log out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
