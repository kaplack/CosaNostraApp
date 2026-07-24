import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import authRoutes from './routes/authRoutes.js';
import adminPizzaRoutes from './routes/adminPizzaRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import adminPaymentSettingRoutes from './routes/adminPaymentSettingRoutes.js';
import adminIngredientRoutes from './routes/adminIngredientRoutes.js';
import customerAddressRoutes from './routes/customerAddressRoutes.js';
import savedCustomPizzaRoutes from './routes/savedCustomPizzaRoutes.js';
import adminPizzaSizeRoutes from './routes/adminPizzaSizeRoutes.js';
import builderRoutes from './routes/builderRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentSettingRoutes from './routes/paymentSettingRoutes.js';
import communityRoutes from './routes/communityRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cosanostra-backend' });
});

app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment-settings', paymentSettingRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/customer/addresses', customerAddressRoutes);
app.use('/api/customer/pizzas', savedCustomPizzaRoutes);
app.use('/api/admin/pizzas', adminPizzaRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/payment-settings', adminPaymentSettingRoutes);
app.use('/api/admin/pizza-sizes', adminPizzaSizeRoutes);
app.use('/api/admin/ingredients', adminIngredientRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
