import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { MenuItem, User } from '../models/index.js';
import { ensureDefaultPaymentSettings } from '../models/paymentSettingModel.js';
import { ensureDefaultPizzaSizes } from '../models/pizzaSizeModel.js';

const initialMenuItems = [
  {
    id: 1,
    name: 'Margherita',
    unitPrice: 18,
    ingredients: ['tomato', 'mozzarella', 'basil'],
    soldOut: false,
    imageUrl: 'https://react-fast-pizza-api.onrender.com/pizzas/margherita.webp',
  },
  {
    id: 2,
    name: 'Capricciosa',
    unitPrice: 22,
    ingredients: ['tomato', 'mozzarella', 'ham', 'mushrooms', 'artichoke'],
    soldOut: false,
    imageUrl: 'https://react-fast-pizza-api.onrender.com/pizzas/capricciosa.webp',
  },
  {
    id: 3,
    name: 'Romana',
    unitPrice: 20,
    ingredients: ['tomato', 'mozzarella', 'prosciutto'],
    soldOut: false,
    imageUrl: 'https://react-fast-pizza-api.onrender.com/pizzas/romana.webp',
  },
  {
    id: 4,
    name: 'Prosciutto e Rucola',
    unitPrice: 24,
    ingredients: ['tomato', 'mozzarella', 'prosciutto', 'arugula'],
    soldOut: false,
    imageUrl: 'https://react-fast-pizza-api.onrender.com/pizzas/prosciutto-e-rucola.webp',
  },
  {
    id: 5,
    name: 'Diavola',
    unitPrice: 21,
    ingredients: ['tomato', 'mozzarella', 'spicy salami', 'chili flakes'],
    soldOut: false,
    imageUrl: 'https://react-fast-pizza-api.onrender.com/pizzas/diavola.webp',
  },
  {
    id: 6,
    name: 'Vegetale',
    unitPrice: 19,
    ingredients: ['tomato', 'mozzarella', 'peppers', 'onion', 'mushrooms'],
    soldOut: false,
    imageUrl: 'https://react-fast-pizza-api.onrender.com/pizzas/vegetale.webp',
  },
];

export async function seedInitialData() {
  await ensureDefaultPaymentSettings();
  await ensureDefaultPizzaSizes();

  const menuCount = await MenuItem.count();

  if (menuCount === 0) {
    await MenuItem.bulkCreate(initialMenuItems);
  }

  const adminEmail = env.adminEmail.toLowerCase();
  const admin = await User.scope('withPassword').findOne({
    where: { email: adminEmail },
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 12);

    await User.create({
      name: env.adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isActive: true,
    });
  }
}
