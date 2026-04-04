import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface decodedTokenProps {
  usuario: {
    id: string;
    nome: string;
    email: string;
    funcao: string;
  };
  iat: number;
  exp: number;
}

function decodeJwtPayload(token: string): decodedTokenProps | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("nextauth.token")?.value;
  const pathname = request.nextUrl.pathname;

  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/dashboard") {
    return NextResponse.next();
  }

  const decoded = decodeJwtPayload(authToken);
  if (!decoded?.usuario?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const userId = decoded.usuario.id;

  try {
    const response = await fetch(
      // `http://localhost:3333/rotas-usuarios/${userId}`,
      `http://82.197.67.88:3333/rotas-usuarios/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const rotas: { rota: string }[] = await response.json();
    const hasAccess = rotas.some(
      (r) => r.rota === pathname || pathname.startsWith(r.rota + "/")
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
