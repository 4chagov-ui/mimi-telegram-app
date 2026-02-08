import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error('GET /api/admin/categories', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, sort = 0 } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }
    const category = await prisma.category.create({
      data: { name: name.trim(), sort: Number(sort) || 0 },
    });
    return NextResponse.json(category);
  } catch (e) {
    console.error('POST /api/admin/categories', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
