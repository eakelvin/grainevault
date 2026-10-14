"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/components/auth/user-avatar-menu";
import { getUserNames } from "@/lib/helpers/user-display";
import { CONTACT_EMAIL } from "@/lib/legal";
import { createClient } from "@/lib/supabase/client";

const MESSAGE_LIMIT = 4000;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const user = useCurrentUser();
  const prefilled = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || prefilled.current) return;
    const account = getUserNames(user);
    const full = [account.first, account.last].filter(Boolean).join(" ");
    if (full) setName(full);
    if (account.email) setEmail(account.email);
    prefilled.current = true;
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSent(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length > 120) {
      setError("Enter your name.");
      return;
    }
    if (!isEmail(trimmedEmail) || trimmedEmail.length > 320) {
      setError("Enter a valid email address so we can reply.");
      return;
    }
    if (trimmedMessage.length < 10) {
      setError("Write a message of at least a few words.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const supabase = createClient();
    const {
      data: { user: account },
    } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      user_id: account?.id ?? null,
    });
    setIsSubmitting(false);

    if (insertError) {
      setError(
        `Couldn't send this message. Email ${CONTACT_EMAIL} instead, or try again.`
      );
      return;
    }

    setMessage("");
    setSent(true);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed text-slate-300">
        Email{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-medium text-indigo-300 underline-offset-4 hover:text-white hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        , or send a message below. We keep it so we can reply.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Name
          </label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="h-11 border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-11 border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-300">
            Message
          </label>
          <Textarea
            id="contact-message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, MESSAGE_LIMIT))}
            placeholder="How can we help?"
            rows={6}
            className="min-h-32 border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-500"
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {sent ? (
          <p role="status" className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">
            Message received. We&apos;ll reply to the email you entered.
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 text-white hover:from-indigo-600 hover:to-violet-700"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  );
}
