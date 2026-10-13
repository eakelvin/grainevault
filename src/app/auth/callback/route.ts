import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_NEXT_COOKIE,
  authNextCookieOptions,
  readAuthNext,
  safeNextPath,
  withNext,
} from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const safeNext = safeNextPath(
    safeNextPath(searchParams.get("next"), "") ||
      readAuthNext(cookieStore.get(AUTH_NEXT_COOKIE)?.value)
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectResponse = NextResponse.redirect(`${origin}${safeNext}`);
      redirectResponse.cookies.set(AUTH_NEXT_COOKIE, "", authNextCookieOptions(0));
      return redirectResponse;
    }
  }

  return NextResponse.redirect(
    `${origin}${withNext(
      `/login?error=${encodeURIComponent("Could not complete sign-in. Please try again.")}`,
      safeNext
    )}`
  );
}
