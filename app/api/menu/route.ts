import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          include: {
            variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
          },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error('GET /api/menu', e);
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}
