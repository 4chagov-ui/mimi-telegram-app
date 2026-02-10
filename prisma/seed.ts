import path from 'path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Загружаем .env, но не перезаписываем переменные из командной строки (например DATABASE_URL)
config({ path: path.resolve(__dirname, '..', '.env'), override: false });

const dbUrl = process.env.DATABASE_URL ?? '';
const host = dbUrl.replace(/:[^:@]+@/, ':****@').replace(/^[^@]+@/, '');
console.log('Seed: connecting to', host || '(no DATABASE_URL)');

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promoCode.deleteMany();

  const cat1 = await prisma.category.create({ data: { name: 'Сеты', sort: 1 } });
  const cat2 = await prisma.category.create({ data: { name: 'Салаты', sort: 2 } });
  const cat3 = await prisma.category.create({ data: { name: 'Горячее', sort: 3 } });
  const cat4 = await prisma.category.create({ data: { name: 'Напитки', sort: 4 } });

  const set1 = await prisma.product.create({
    data: {
      categoryId: cat1.id,
      name: 'Сет «Классика»',
      description: 'Роллы Филадельфия, Калифорния, Дракон. 24 шт.',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
      isActive: true,
    },
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: set1.id, name: 'Маленький (24 шт.)', price: 89000, weight: '~400 г', isActive: true },
      { productId: set1.id, name: 'Большой (36 шт.)', price: 129000, weight: '~600 г', isActive: true },
    ],
  });

  const set2 = await prisma.product.create({
    data: {
      categoryId: cat1.id,
      name: 'Сет «Острый»',
      description: 'Острые роллы с тобико и соусом спайси.',
      imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400',
      isActive: true,
    },
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: set2.id, name: 'Стандарт (20 шт.)', price: 75000, weight: '~350 г', isActive: true },
      { productId: set2.id, name: 'Увеличенный (30 шт.)', price: 105000, weight: '~500 г', isActive: true },
    ],
  });

  await prisma.product.create({
    data: {
      categoryId: cat1.id,
      name: 'Сет «Семейный»',
      description: 'Разнообразие роллов и суши для компании.',
      imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
      isActive: true,
      variants: {
        create: { name: '1 порция', price: 199000, weight: '~1 кг', isActive: true },
      },
    },
  });

  const salad1 = await prisma.product.create({
    data: {
      categoryId: cat2.id,
      name: 'Салат «Цезарь»',
      description: 'Курица, салат романо, пармезан, соус цезарь.',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      isActive: true,
    },
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: salad1.id, name: '150 г', price: 29000, weight: '150 г', isActive: true },
      { productId: salad1.id, name: '250 г', price: 39000, weight: '250 г', isActive: true },
    ],
  });

  await prisma.product.create({
    data: {
      categoryId: cat2.id,
      name: 'Салат «Греческий»',
      description: 'Помидоры, огурцы, оливки, сыр фета, оливковое масло.',
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      isActive: true,
      variants: {
        create: { name: 'Порция 250 г', price: 35000, weight: '250 г', isActive: true },
      },
    },
  });

  await prisma.product.create({
    data: {
      categoryId: cat2.id,
      name: 'Салат с лососем',
      description: 'Свежий лосось, микс салатов, авокадо.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      isActive: true,
      variants: {
        create: { name: 'Стандарт', price: 45000, weight: '200 г', isActive: true },
      },
    },
  });

  const hot1 = await prisma.product.create({
    data: {
      categoryId: cat3.id,
      name: 'Лапша вок с курицей',
      description: 'Курица, лапша удон, овощи, соус терияки.',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a2854112c6b?w=400',
      isActive: true,
    },
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: hot1.id, name: 'Стандарт', price: 39000, weight: '400 г', isActive: true },
      { productId: hot1.id, name: 'Большая порция', price: 49000, weight: '550 г', isActive: true },
    ],
  });

  await prisma.product.create({
    data: {
      categoryId: cat3.id,
      name: 'Суп том ям',
      description: 'Креветки, грибы, лемонграсс, кокосовое молоко.',
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      isActive: true,
      variants: {
        create: { name: 'Порция 350 мл', price: 42000, weight: '350 мл', isActive: true },
      },
    },
  });

  await prisma.product.create({
    data: {
      categoryId: cat3.id,
      name: 'Рис с овощами',
      description: 'Жареный рис с сезонными овощами и соевым соусом.',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      isActive: true,
      variants: {
        create: { name: 'Порция', price: 28000, weight: '300 г', isActive: true },
      },
    },
  });

  await prisma.product.create({
    data: {
      categoryId: cat4.id,
      name: 'Морс клюквенный',
      description: 'Домашний морс из клюквы, 500 мл.',
      imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
      isActive: true,
      variants: {
        create: { name: '500 мл', price: 12000, weight: '500 мл', isActive: true },
      },
    },
  });

  const tea = await prisma.product.create({
    data: {
      categoryId: cat4.id,
      name: 'Чай зелёный',
      description: 'Зелёный чай с жасмином.',
      imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
      isActive: true,
    },
  });
  await prisma.productVariant.createMany({
    data: [
      { productId: tea.id, name: '300 мл', price: 8000, weight: '300 мл', isActive: true },
      { productId: tea.id, name: '500 мл', price: 12000, weight: '500 мл', isActive: true },
    ],
  });

  await prisma.product.create({
    data: {
      categoryId: cat4.id,
      name: 'Лимонад домашний',
      description: 'Свежий лимонад с мятой.',
      imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400',
      isActive: true,
      variants: {
        create: { name: '500 мл', price: 15000, weight: '500 мл', isActive: true },
      },
    },
  });

  await prisma.promoCode.create({
    data: {
      code: 'FIRST10',
      type: 'PERCENT',
      value: 10,
      minTotal: 100000,
      isActive: true,
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
