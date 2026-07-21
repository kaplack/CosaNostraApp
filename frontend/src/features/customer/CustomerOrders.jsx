import { Link, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCurrentCustomer } from '../../services/apiCustomerAuth';
import { getMyOrders } from '../../services/apiRestaurant';
import { replaceCart } from '../cart/cartSlice';
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  formatPaymentStatus,
} from '../../utils/helpers';

function CustomerOrders() {
  const orders = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function repeatOrder(order) {
    dispatch(
      replaceCart(
        order.cart.map((item) => ({
          pizzaId: item.pizzaId,
          sourcePizzaId: item.sourcePizzaId,
          isCustom: item.isCustom,
          savedPizzaId: item.savedPizzaId,
          savedPizzaName: item.savedPizzaName,
          name: item.name,
          baseName: item.baseName,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          customRecipe: item.customRecipe,
        })),
      ),
    );
    navigate('/cart');
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mis pedidos</h1>
        <p className="text-sm text-stone-500">
          Puedes seguir cada pedido con su codigo.
        </p>
        <Link
          to="/account/addresses"
          className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          Mis direcciones
        </Link>
        <Link
          to="/account/pizzas"
          className="ml-4 mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          Mis pizzas
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-md border border-stone-200 p-5">
          <p className="text-sm text-stone-600">Aun no tienes pedidos guardados.</p>
          <Link
            to="/menu"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Ver carta
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4">Codigo</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 pr-4">Pago</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Fecha</th>
                <th className="py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 pr-4 font-semibold">{order.id}</td>
                  <td className="py-3 pr-4">{formatOrderStatus(order.status)}</td>
                  <td className="py-3 pr-4">
                    {formatPaymentStatus(order.paymentStatus)}
                  </td>
                  <td className="py-3 pr-4">
                    {formatCurrency(order.orderPrice + order.priorityPrice)}
                  </td>
                  <td className="py-3 pr-4">{formatDate(order.createdAt)}</td>
                  <td className="py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => repeatOrder(order)}
                        className="font-semibold text-green-700 hover:underline"
                      >
                        Repetir pedido
                      </button>
                      <Link
                        to={`/order/${order.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        Ver seguimiento
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentCustomer();
    if (!user) return redirect('/login');

    return getMyOrders();
  } catch {
    return redirect('/login');
  }
}

export default CustomerOrders;
