"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/types";

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "Couldn't delete your account. Please try again.");
        setDeleting(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(routes.home);
      router.refresh();
    } catch {
      setError("Couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">Danger zone</h2>
      <p className="mt-1 text-sm text-slate-400">
        Permanently delete your GraineVault account and data.
      </p>

      <div className="mt-4 rounded-xl border border-rose-900/80 bg-[#1a1214] p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-white">Request for account deletion</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              Deleting your account is permanent and cannot be undone. Your
              ideas, files, and profile are removed when you confirm. We may
              retain some billing records and logs for longer where required or
              permitted by law.
            </p>
            <Button
              type="button"
              onClick={() => {
                setError(null);
                setOpen(true);
              }}
              className="mt-4 h-8 rounded-lg bg-rose-500/80 px-3 text-sm font-medium text-white hover:bg-rose-500"
            >
              Request to delete account
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (deleting) return;
          setOpen(next);
        }}
      >
        <DialogContent
          showCloseButton={!deleting}
          className="border-slate-700/60 bg-slate-900/95 text-slate-200 backdrop-blur-xl sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Delete your account?</DialogTitle>
            <DialogDescription className="text-slate-400">
              This removes your login, ideas, and files. A Pro subscription is
              canceled. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          ) : null}
          <DialogFooter className="border-slate-700/60 bg-transparent">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="gap-2 bg-rose-500 text-white hover:bg-rose-600"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
