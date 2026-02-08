import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Укажите улицу'),
  building: z.string().min(1, 'Укажите дом'),
  apartment: z.string().optional(),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  doorcode: z.string().optional(),
});

export const checkoutSchema = z.object({
  deliveryType: z.enum(['DELIVERY', 'PICKUP']),
  customerName: z.string().min(2, 'Имя от 2 символов'),
  phone: z.string().min(10, 'Введите корректный телефон'),
  address: addressSchema.optional(),
  comment: z.string().optional(),
  cutlery: z.boolean().optional(),
  desiredTime: z.string().optional(),
  promoCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().nullable(),
      nameSnapshot: z.string(),
      variantSnapshot: z.string().nullable(),
      priceSnapshot: z.number(),
      qty: z.number().int().positive(),
    })
  ),
  subtotal: z.number().int().min(0),
  discount: z.number().int().min(0).optional(),
  total: z.number().int().min(0),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type AddressPayload = z.infer<typeof addressSchema>;

export const promocodeValidateSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().int().min(0),
});
