//import { Link } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import LinkButton from '../../ui/LinkButton';
import CartItem from './CartItem';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart } from './cartSlice';
import EmptyCart from './EmptyCart';

function Cart() {
  //const cart = fakeCart;
  //console.log(cart);

  const dispatch = useDispatch();

  const username = useSelector((state) => state.user.username);
  const cart = useSelector(getCart);
  //console.log(cart);

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-3">
      <LinkButton to="/menu">&larr; Ver menu</LinkButton>

      <h2 className="mt-7 text-xl font-semibold">
        Tus compras, <span className="capitalize">{username}</span>
      </h2>

      <ul className="mt-3 divide-y divide-stone-200 border-b">
        {cart.map((item) => (
          <CartItem item={item} key={item.pizzaId} />
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          to="/order/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold uppercase text-stone-800 transition hover:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2"
        >
          <FiShoppingBag aria-hidden="true" />
          Ordenar pizzas
        </Link>
        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-300 px-5 py-3 text-sm font-semibold uppercase text-stone-500 transition hover:bg-stone-200 hover:text-stone-800 focus:outline-none focus:ring focus:ring-stone-200 focus:ring-offset-2"
        >
          <FiTrash2 aria-hidden="true" />
          Limpiar carrito
        </button>
      </div>
    </div>
  );
}

export default Cart;
