import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const categoryId = req.nextUrl.searchParams.get('categoryId');
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        category: { select: { id: true, name: true } },
        variants: { orderBy: { price: 'asc' } },
      },
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error('GET /api/admin/products', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { categoryId, name, description, imageUrl, isActive = true, variants = [] } = body;
    if (!categoryId || !name) {
      return NextResponse.json({ error: 'categoryId and name required' }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        categoryId,
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        isActive: Boolean(isActive),
        variants: {
          create: (Array.isArray(variants) ? variants : []).map((v: { name: string; price: number; weight?: string }) => ({
            name: String(v.name).trim(),
            price: Math.round(Number(v.price) || 0),
            weight: v.weight ? String(v.weight).trim() : null,
          })),
        },
      },
      include: { category: true, variants: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error('POST /api/admin/products', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
