import TelegramBot from 'node-telegram-bot-api';

let bot: TelegramBot | null = null;

export function getTelegramBot(): TelegramBot | null {
  if (bot) return bot;
  const token = process.env.TG_BOT_TOKEN;
  if (!token) return null;
  bot = new TelegramBot(token, { polling: false });
  return bot;
}

export function formatOrderMessage(order: {
  number: number;
  deliveryType: string;
  customerName: string;
  phone: string;
  addressJson: string | null;
  comment: string | null;
  cutlery: boolean;
  items: { nameSnapshot: string; variantSnapshot: string | null; priceSnapshot: number; qty: number }[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  desiredTime: string | null;
}): string {
  const deliveryLabel = order.deliveryType === 'DELIVERY' ? 'Доставка' : 'Самовывоз';
  let addr = '';
  if (order.addressJson) {
    try {
      const a = JSON.parse(order.addressJson) as Record<string, string>;
      addr = [a.street, a.building, a.apartment, a.entrance, a.floor, a.doorcode]
        .filter(Boolean)
        .join(', ');
    } catch {
      addr = order.addressJson;
    }
  }
  const lines: string[] = [
    `🆕 Новый заказ №${order.number}`,
    '',
    `Тип: ${deliveryLabel}`,
    `Имя: ${order.customerName}`,
    `Телефон: ${order.phone}`,
  ];
  if (addr) lines.push(`Адрес: ${addr}`);
  if (order.desiredTime) lines.push(`Время: ${order.desiredTime}`);
  lines.push('');
  lines.push('Позиции:');
  for (const i of order.items) {
    const name = i.variantSnapshot ? `${i.nameSnapshot} (${i.variantSnapshot})` : i.nameSnapshot;
    lines.push(`  • ${name} × ${i.qty} — ${(i.priceSnapshot * i.qty) / 100} ₽`);
  }
  lines.push('');
  lines.push(`Подытог: ${order.subtotal / 100} ₽`);
  if (order.discount > 0) {
    lines.push(`Скидка: -${order.discount / 100} ₽${order.promoCode ? ` (${order.promoCode})` : ''}`);
  }
  lines.push(`Итого: ${order.total / 100} ₽`);
  if (order.cutlery) lines.push('Приборы: да');
  if (order.comment) lines.push(`Комментарий: ${order.comment}`);
  return lines.join('\n');
}

export async function sendOrderToTelegram(order: Parameters<typeof formatOrderMessage>[0]): Promise<void> {
  const b = getTelegramBot();
  const chatId = process.env.TG_CHAT_ID;
  if (!b || !chatId) return;
  const text = formatOrderMessage(order);
  await b.sendMessage(chatId, text);
}
