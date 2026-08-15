import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PUBLIC_HOSTS = new Set(["simsaj.sk", "www.simsaj.sk"]);

function isAuthorizedForAcceptance(request: NextRequest) {
  const username = process.env.ACC_BASIC_AUTH_USER;
  const password = process.env.ACC_BASIC_AUTH_PASSWORD;
  const authorization = request.headers.get("authorization");

  if (!username || !password || !authorization?.startsWith("Basic ")) return false;

  try {
    const credentials = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    return credentials === `${username}:${password}`;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const hostname = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();
  const isAcceptance = hostname === "acc.simsaj.sk";
  const isNonProduction = !PUBLIC_HOSTS.has(hostname) && hostname !== "localhost";

  if (isAcceptance && !isAuthorizedForAcceptance(request)) {
    return new NextResponse("Prihlásenie je potrebné.", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "WWW-Authenticate": 'Basic realm="SIMSAJ ACC", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  }

  const requiresSessionUpdate =
    request.nextUrl.pathname.startsWith("/admin") ||
    ["/prihlasenie", "/nastavit-heslo", "/odhlasenie"].includes(request.nextUrl.pathname);
  const response = requiresSessionUpdate ? await updateSession(request) : NextResponse.next();

  if (isNonProduction) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
