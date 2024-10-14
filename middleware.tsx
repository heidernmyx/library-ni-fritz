import { getToken, type JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


function handleAdminRoutes(pathUrl: string, token: JWT | null, req: NextRequest, referer: string | null) {
  if (token?.usertype === "Admin") {
    return NextResponse.next();
  } else {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

function handleProtectedRoutes(pathUrl: string, token: JWT | null, req: NextRequest) {
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  } else {
    return NextResponse.next();
  }
}

function handlePublicRoutes(pathUrl: string, token: JWT | null, req: NextRequest) {
  if (token?.usertype === "Admin") {
    return NextResponse.redirect(new URL('/admin_dashboard', req.url));
  } else if (token?.usertype === "Librarian") {
    return NextResponse.redirect(new URL('/librarian', req.url));
  } else if (token?.usertype === "User") {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } else {
    // return NextResponse.next();
  }
}

export async function middleware(req: NextRequest) {

  const referer = req.headers.get("referer");
  
  if (referer) {
    console.log('Previous URL:', referer);
  } else {
    console.log('No referer available');
  }

  const pathUrl = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminRoute = /^\/admin_dashboard(.*)/.test(pathUrl);
  const isProtectedRoute = /^\/(dashboard|librarian|admin_dashboard)(.*)/.test(pathUrl);

  const isPublicRoute = ['/auth/signin', '/'].includes(pathUrl);

  if (isAdminRoute) {
    return handleAdminRoutes(pathUrl, token, req, referer);
  } else if (isProtectedRoute) {
    return handleProtectedRoutes(pathUrl, token, req);
  } else if (isPublicRoute) {
    return handlePublicRoutes(pathUrl, token, req);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/", "/auth(.*)", "/dashboard(.*)", "/librarian(.*)", "/admin_dashboard(.*)"] };
