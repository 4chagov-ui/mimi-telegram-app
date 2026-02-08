/**
 * ЮKassa (YooKassa) — приём оплаты картой и др. в рублях.
 * Документация: https://yookassa.ru/developers
 *
 * В .env нужны:
 *   YOOKASSA_SHOP_ID — идентификатор магазина
 *   YOOKASSA_SECRET_KEY — секретный ключ
 *
 * В личном кабинете ЮKassa включите уведомления (webhook) на URL:
 *   https://ваш-домен/api/payments/webhook
 */

import type { PaymentProvider, PaymentResult } from './payment-provider';

const API_URL = 'https://api.yookassa.ru/v3';

function getAuth(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secret) throw new Error('YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY required');
  return Buffer.from(`${shopId}:${secret}`).toString('base64');
}

export const yookassaProvider: PaymentProvider = {
  async createPayment(params) {
    const { orderId, orderNumber, amountCents, description, returnUrl, metadata = {} } = params;
    const amountRub = (amountCents / 100).toFixed(2);

    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': `${orderId}-${Date.now()}`,
          Authorization: `Basic ${getAuth()}`,
        },
        body: JSON.stringify({
          amount: { value: amountRub, currency: 'RUB' },
          confirmation: { type: 'redirect', return_url: returnUrl },
          description: description ?? `Заказ №${orderNumber}`,
          metadata: { orderId, orderNumber: String(orderNumber), ...metadata },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('YooKassa create payment error:', res.status, err);
        return { success: false, error: `Ошибка платёжной системы: ${res.status}` };
      }

      const data = (await res.json()) as {
        id: string;
        status: string;
        confirmation?: { confirmation_url?: string };
      };
      const paymentUrl = data.confirmation?.confirmation_url;

      if (!paymentUrl) {
        return { success: false, error: 'Нет ссылки на оплату в ответе ЮKassa' };
      }

      return {
        success: true,
        transactionId: data.id,
        paymentUrl,
      };
    } catch (e) {
      console.error('YooKassa createPayment', e);
      return { success: false, error: 'Не удалось создать платёж' };
    }
  },

  async checkPayment(transactionId: string): Promise<PaymentResult> {
    try {
      const res = await fetch(`${API_URL}/payments/${transactionId}`, {
        headers: { Authorization: `Basic ${getAuth()}` },
      });
      if (!res.ok) return { success: false, error: 'Payment not found' };
      const data = (await res.json()) as { status: string };
      const success = data.status === 'succeeded';
      return { success, transactionId, error: success ? undefined : data.status };
    } catch (e) {
      console.error('YooKassa checkPayment', e);
      return { success: false, error: 'Ошибка проверки' };
    }
  },
};

export function isYooKassaConfigured(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}
