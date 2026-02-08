import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promocodeValidateSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = promocodeValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { code, cartTotal } = parsed.data;
    const promo = await prisma.promoCode.findFirst({
      where: { code: code.toUpperCase().trim(), isActive: true },
    });
    if (!promo) {
      return NextResponse.json({ valid: false, error: 'Промокод не найден' });
    }
    const minTotal = promo.minTotal ?? 0;
    if (cartTotal < minTotal) {
      return NextResponse.json({
        valid: false,
        error: `Минимальная сумма заказа для промокода: ${minTotal / 100} ₽`,
      });
    }
    let discount = 0;
    if (promo.type === 'PERCENT') {
      discount = Math.round((cartTotal * promo.value) / 100);
    } else if (promo.type === 'FIXED') {
      discount = Math.min(promo.value, cartTotal);
    }
    const total = Math.max(0, cartTotal - discount);
    return NextResponse.json({
      valid: true,
      discount,
      total,
      code: promo.code,
    });
  } catch (e) {
    console.error('POST /api/promocode/validate', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
