/**
 * Интерфейс для интеграции онлайн-оплаты.
 * Поддерживаются: заглушка (без оплаты), ЮKassa и др.
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  /** Ссылка на страницу оплаты (редирект пользователя) */
  paymentUrl?: string;
  error?: string;
}

export interface PaymentProvider {
  /** Создать платёж и вернуть ссылку на оплату или результат списания */
  createPayment(params: {
    orderId: string;
    orderNumber: number;
    amountCents: number;
    description?: string;
    returnUrl: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult>;
  /** Проверить статус платежа (для отложенных способов) */
  checkPayment?(transactionId: string): Promise<PaymentResult>;
}

/** Заглушка: не списывает деньги, всегда успех. Используется, если оплата отключена. */
export const stubPaymentProvider: PaymentProvider = {
  async createPayment() {
    return { success: true, transactionId: `stub-${Date.now()}` };
  },
};
