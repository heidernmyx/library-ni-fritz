import { getSession } from "next-auth/react";
import { getToken, type JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { request } from "http";
// export { default } from "next-auth/middleware"

function handleAdminRoutes(pathUrl: string, token: JWT | null, req: NextRequest) {
  if (token!.usertype == "Admin") {
    return NextResponse.next();
  }
  else {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

function handleProtectedRoutes(pathUrl: string, token: JWT | null, req: NextRequest) {
  // if (pathUrl === '/dashboard' || pathUrl === '/admin_dashboard(.*)') {
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  // else if (pathUrl === '/admin_dashboard' && token.usertype == "Admin") {
  //   return null;
  // }
  else {
    return NextResponse.next();
  }
}

function handlePublicRoutes(pathUrl: string, token: JWT | null, req: NextRequest) {
  if (pathUrl === '/auth/signin'
      // || pathUrl === '/auth/signup'
    ) {
      console.log(token?.usertype )
    if (token?.usertype == "Admin") {
      return NextResponse.redirect(new URL('/admin_dashboard', req.url));
    }
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } 
    
    else {
      return NextResponse.next();
    }
  }
}

export async function middleware(req: NextRequest) {
  const pathUrl = req.nextUrl.pathname;

  const isAdminRoute = ['/admin_dashboard'].includes(pathUrl);
  const isProtectedRoute = ['/dashboard', '/dashboard/liked-posts', '/admin_dashboard'].includes(pathUrl);
  const isPublicRoute = ['/auth/signin'].includes(pathUrl);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });


  if (isProtectedRoute) {
    return handleProtectedRoutes(pathUrl, token, req);
  } else if (isPublicRoute) {
    return handlePublicRoutes(pathUrl, token, req);
  } else if (isAdminRoute) {
    console.log(true)
    return handleAdminRoutes(pathUrl, token, req);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/", "/dashboard(.*)", "/auth(.*)", "/admin_dashboard(.*)"] };