import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations';
import { sendOrderToTelegram } from '@/lib/telegram-bot';
import { getPaymentProvider, isPaymentEnabled } from '@/lib/get-payment-provider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    if (data.deliveryType === 'DELIVERY' && !data.address) {
      return NextResponse.json(
        { error: 'Адрес обязателен для доставки' },
        { status: 400 }
      );
    }

    const last = await prisma.order.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
    const number = (last?.number ?? 0) + 1;
    const addressJson = data.address ? JSON.stringify(data.address) : null;
    const paymentEnabled = isPaymentEnabled();
    const status = paymentEnabled ? 'PENDING_PAYMENT' : 'NEW';

    const order = await prisma.order.create({
      data: {
        number,
        status,
        deliveryType: data.deliveryType,
        customerName: data.customerName,
        phone: data.phone,
        addressJson,
        comment: data.comment ?? null,
        cutlery: data.cutlery ?? false,
        subtotal: data.subtotal,
        discount: data.discount ?? 0,
        total: data.total,
        promoCode: data.promoCode ?? null,
        desiredTime: data.desiredTime ?? null,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            nameSnapshot: i.nameSnapshot,
            variantSnapshot: i.variantSnapshot,
            priceSnapshot: i.priceSnapshot,
            qty: i.qty,
          })),
        },
      },
      include: { items: true },
    });

    if (paymentEnabled) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const returnUrl = `${baseUrl}/order/success?id=${order.id}&number=${order.number}`;
      const provider = getPaymentProvider();
      const result = await provider.createPayment({
        orderId: order.id,
        orderNumber: order.number,
        amountCents: order.total,
        description: `Заказ №${order.number} МИМИ`,
        returnUrl,
        metadata: { orderId: order.id },
      });

      if (!result.success) {
        await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELED' } });
        return NextResponse.json({ error: result.error ?? 'Ошибка оплаты' }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: result.transactionId, paymentStatus: 'PENDING' },
      });

      return NextResponse.json({
        orderId: order.id,
        number: order.number,
        paymentUrl: result.paymentUrl,
      });
    }

    try {
      await sendOrderToTelegram({
        number: order.number,
        deliveryType: order.deliveryType,
        customerName: order.customerName,
        phone: order.phone,
        addressJson: order.addressJson,
        comment: order.comment,
        cutlery: order.cutlery,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        promoCode: order.promoCode,
        desiredTime: order.desiredTime,
      });
    } catch (e) {
      console.error('Telegram notify failed', e);
    }
    return NextResponse.json({ orderId: order.id, number: order.number });
  } catch (e) {
    console.error('POST /api/payments/create', e);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
