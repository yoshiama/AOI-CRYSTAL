import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/equipo/dashboard', '/equipo/productos', '/equipo/pedidos', '/equipo/finanzas', '/equipo/configuracion'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected) {
    const session = request.cookies.get('session');
    if (!session?.value) {
      return NextResponse.redirect(new URL('/equipo/login', request.url));
    }
  }

  if (pathname === '/equipo' || pathname === '/admin') {
    return NextResponse.redirect(new URL('/equipo/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/equipo/:path*', '/admin'],
};
