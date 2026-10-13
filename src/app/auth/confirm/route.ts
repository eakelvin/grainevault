import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_NEXT_COOKIE,
  authNextCookieOptions,
  readAuthNext,
  safeNextPath,
  withNext,
} from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const safeNext = safeNextPath(
    safeNextPath(searchParams.get("next"), "") ||
      readAuthNext(request.cookies.get(AUTH_NEXT_COOKIE)?.value)
  );

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const redirectResponse = NextResponse.redirect(new URL(safeNext, request.url));
      redirectResponse.cookies.set(AUTH_NEXT_COOKIE, "", authNextCookieOptions(0));
      return redirectResponse;
    }
  }

  return NextResponse.redirect(
    new URL(
      withNext(
        `/login?error=${encodeURIComponent("Could not verify your email link. Please try again.")}`,
        safeNext
      ),
      request.url
    )
  );
}
