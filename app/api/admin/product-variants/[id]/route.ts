import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const data: { name?: string; price?: number; weight?: string | null; isActive?: boolean } = {};
    if (typeof body.name === 'string') data.name = body.name.trim();
    if (typeof body.price !== 'undefined') data.price = Math.round(Number(body.price) || 0);
    if ('weight' in body) data.weight = body.weight ? String(body.weight).trim() : null;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    const variant = await prisma.productVariant.update({
      where: { id },
      data,
    });
    return NextResponse.json(variant);
  } catch (e) {
    console.error('PATCH /api/admin/product-variants/[id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(_req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.productVariant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/product-variants/[id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
