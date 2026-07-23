import { FiArrowLeft, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import CartItem from './CartItem';
import { clearCart, getCart, getTotalCartPrice, getTotalCartQuantity } from './cartSlice';
import EmptyCart from './EmptyCart';

function Cart() {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.username);
  const cart = useSelector(getCart);
  const totalPrice = useSelector(getTotalCartPrice);
  const totalQuantity = useSelector(getTotalCartQuantity);

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="cn-paper min-h-full border-x-[3px] border-stone-950 px-4 py-8 sm:px-8 lg:px-12">
      <Link to="/menu" className="inline-flex items-center gap-2 text-xs font-black uppercase hover:text-[#d7261e]">
        <FiArrowLeft /> Volver a la carta
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b-[4px] border-stone-950 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Tu pedido</p>
          <h1 className="cn-display text-5xl uppercase italic sm:text-6xl">Carrito</h1>
          {username && <p className="mt-1 text-sm font-semibold">Listo para ordenar, <span className="capitalize">{username}</span>.</p>}
        </div>
        <div className="rotate-1 border-[3px] border-stone-950 bg-[#f9bd16] px-5 py-3 text-right shadow-[4px_4px_0_#111312]">
          <p className="text-[10px] font-black uppercase tracking-wide">{totalQuantity} {totalQuantity === 1 ? 'pizza' : 'pizzas'}</p>
          <p className="text-xl font-black text-[#d7261e]">{formatCurrency(totalPrice)}</p>
        </div>
      </div>

      <ul className="mt-7 grid gap-4">
        {cart.map((item) => <CartItem item={item} key={item.pizzaId} />)}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <button type="button" onClick={() => dispatch(clearCart())} className="inline-flex items-center justify-center gap-2 border-[3px] border-stone-950 bg-[#fff8e8] px-5 py-3 text-sm font-black uppercase transition hover:bg-stone-200">
          <FiTrash2 /> Limpiar carrito
        </button>
        <Link to="/order/new" className="cn-shadow inline-flex items-center justify-center gap-2 border-[3px] border-stone-950 bg-[#f9bd16] px-6 py-3 text-sm font-black uppercase transition hover:-translate-y-1">
          <FiShoppingBag /> Continuar pedido
        </Link>
      </div>
    </div>
  );
}

export default Cart;
