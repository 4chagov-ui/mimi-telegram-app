import { NextRequest } from 'next/server';

export function checkAdmin(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const header = req.headers.get('x-admin-token');
  const query = req.nextUrl.searchParams.get('token');
  return header === token || query === token;
}

export function getAdminTokenFromReq(req: NextRequest): string | null {
  return req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('token');
}
