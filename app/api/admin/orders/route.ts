import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const status = req.nextUrl.searchParams.get('status');
    const where = status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (e) {
    console.error('GET /api/admin/orders', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
