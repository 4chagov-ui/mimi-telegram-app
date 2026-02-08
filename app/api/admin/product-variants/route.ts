import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { productId, name, price, weight } = body;
    if (!productId || !name) {
      return NextResponse.json({ error: 'productId and name required' }, { status: 400 });
    }
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: String(name).trim(),
        price: Math.round(Number(price) || 0),
        weight: weight ? String(weight).trim() : null,
      },
    });
    return NextResponse.json(variant);
  } catch (e) {
    console.error('POST /api/admin/product-variants', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
