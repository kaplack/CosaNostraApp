import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './ui/Home';
import Error from './ui/Error';
import Menu, { loader as menuLoader } from './features/menu/Menu';

import Cart from './features/cart/Cart';
import CreateOrder, {
  action as createOrderAction,
} from './features/order/CreateOrder';
import Order, { loader as orderLoader } from './features/order/Order';
import TrackOrder, {
  action as trackOrderAction,
} from './features/order/TrackOrder';
import AppLayout from './ui/AppLayout';
import AdminDashboard, {
  loader as adminDashboardLoader,
} from './features/admin/AdminDashboard';
import AdminLogin, {
  action as adminLoginAction,
} from './features/admin/AdminLogin';
import AdminLayout, {
  loader as adminLayoutLoader,
} from './features/admin/AdminLayout';
import AdminPizzas, {
  loader as adminPizzasLoader,
} from './features/admin/AdminPizzas';
import AdminOrders, {
  loader as adminOrdersLoader,
} from './features/admin/AdminOrders';
import AdminPayments, {
  loader as adminPaymentsLoader,
} from './features/admin/AdminPayments';
import AdminPizzaSizes, {
  loader as adminPizzaSizesLoader,
} from './features/admin/AdminPizzaSizes';
import AdminIngredients, {
  loader as adminIngredientsLoader,
} from './features/admin/AdminIngredients';
import CustomerLogin, {
  action as customerLoginAction,
} from './features/customer/CustomerLogin';
import CustomerRegister, {
  action as customerRegisterAction,
} from './features/customer/CustomerRegister';
import CustomerOrders, {
  loader as customerOrdersLoader,
} from './features/customer/CustomerOrders';
import CustomerAddresses, {
  loader as customerAddressesLoader,
} from './features/customer/CustomerAddresses';
import CustomerSavedPizzas, {
  loader as customerSavedPizzasLoader,
} from './features/customer/CustomerSavedPizzas';
import PizzaBuilder from './features/builder/PizzaBuilder';
import PublicPizza, { loader as publicPizzaLoader } from './features/community/PublicPizza';
import CreatorProfile, { loader as creatorProfileLoader } from './features/community/CreatorProfile';
import Community, { loader as communityLoader } from './features/community/Community';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/menu',
        element: <Menu />,
        loader: menuLoader,
        errorElement: <Error />,
      },
      { path: '/cart', element: <Cart /> },
      { path: '/builder', element: <PizzaBuilder /> },
      {
        path: '/comunidad',
        element: <Community />,
        loader: communityLoader,
        errorElement: <Error />,
      },
      {
        path: '/p/:slug',
        element: <PublicPizza />,
        loader: publicPizzaLoader,
        errorElement: <Error />,
      },
      {
        path: '/creadores/:slug',
        element: <CreatorProfile />,
        loader: creatorProfileLoader,
        errorElement: <Error />,
      },
      {
        path: '/order/new',
        element: <CreateOrder />,
        action: createOrderAction,
      },
      {
        path: '/order/track',
        element: <TrackOrder />,
        action: trackOrderAction,
      },
      {
        path: '/order/:orderId',
        element: <Order />,
        loader: orderLoader,
        errorElement: <Error />,
      },
      {
        path: '/login',
        element: <CustomerLogin />,
        action: customerLoginAction,
      },
      {
        path: '/register',
        element: <CustomerRegister />,
        action: customerRegisterAction,
      },
      {
        path: '/account/orders',
        element: <CustomerOrders />,
        loader: customerOrdersLoader,
        errorElement: <Error />,
      },
      {
        path: '/account/addresses',
        element: <CustomerAddresses />,
        loader: customerAddressesLoader,
        errorElement: <Error />,
      },
      {
        path: '/account/pizzas',
        element: <CustomerSavedPizzas />,
        loader: customerSavedPizzasLoader,
        errorElement: <Error />,
      },
      //{path: '/cart', element: <Cart />},
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
    action: adminLoginAction,
    errorElement: <Error />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    loader: adminLayoutLoader,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
        loader: adminDashboardLoader,
      },
      {
        path: 'pizzas',
        element: <AdminPizzas />,
        loader: adminPizzasLoader,
      },
      {
        path: 'orders',
        element: <AdminOrders />,
        loader: adminOrdersLoader,
      },
      {
        path: 'payments',
        element: <AdminPayments />,
        loader: adminPaymentsLoader,
      },
      {
        path: 'sizes',
        element: <AdminPizzaSizes />,
        loader: adminPizzaSizesLoader,
      },
      {
        path: 'ingredients',
        element: <AdminIngredients />,
        loader: adminIngredientsLoader,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
