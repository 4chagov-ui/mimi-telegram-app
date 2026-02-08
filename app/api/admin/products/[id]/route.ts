import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin-auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(_req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (e) {
    console.error('GET /api/admin/products/[id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

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
    const data: { name?: string; description?: string | null; imageUrl?: string | null; isActive?: boolean; categoryId?: string } = {};
    if (typeof body.name === 'string') data.name = body.name.trim();
    if ('description' in body) data.description = body.description ? String(body.description).trim() : null;
    if ('imageUrl' in body) data.imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    if (body.categoryId) data.categoryId = body.categoryId;
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true, variants: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error('PATCH /api/admin/products/[id]', e);
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/products/[id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
