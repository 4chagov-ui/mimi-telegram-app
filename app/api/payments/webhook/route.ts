import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderToTelegram } from '@/lib/telegram-bot';

/**
 * Webhook для ЮKassa: при успешной оплате обновляем заказ и шлём уведомление в Telegram.
 * В личном кабинете ЮKassa укажите URL: https://ваш-домен/api/payments/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event as string | undefined;
    const payment = body.object as { id?: string; status?: string; metadata?: { orderId?: string } } | undefined;

    if (event !== 'payment.succeeded' || !payment?.metadata?.orderId) {
      return NextResponse.json({ received: true });
    }

    const orderId = payment.metadata.orderId;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ received: true });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'NEW', paymentStatus: 'SUCCEEDED' },
    });

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
      console.error('Telegram notify failed after payment', e);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('POST /api/payments/webhook', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
