import type { PaymentProvider } from './payment-provider';
import { stubPaymentProvider } from './payment-provider';
import { yookassaProvider, isYooKassaConfigured } from './yookassa';

export function getPaymentProvider(): PaymentProvider {
  if (isYooKassaConfigured()) return yookassaProvider;
  return stubPaymentProvider;
}

export function isPaymentEnabled(): boolean {
  return isYooKassaConfigured();
}
