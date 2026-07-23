import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTotalCartQuantity, getTotalCartPrice } from './cartSlice';
import { formatCurrency } from '../../utils/helpers';

function CartOverview() {
  const totalCartQuantity = useSelector(getTotalCartQuantity);
  const totalCartPrice = useSelector(getTotalCartPrice);

  if (!totalCartQuantity) return null;

  return (
    <div className="relative z-40 flex items-center justify-between border-t-[4px] border-stone-950 bg-[#d7261e] px-4 py-3 text-sm uppercase text-white sm:px-6 md:text-base">
      <p className="space-x-4 font-black">
        <span>
          {totalCartQuantity > 1
            ? totalCartQuantity + ' pizzas'
            : totalCartQuantity + ' pizza'}
        </span>
        <span>{formatCurrency(totalCartPrice)}</span>
      </p>
      <Link to="/cart" className="border-2 border-stone-950 bg-[#f9bd16] px-3 py-2 text-xs font-black text-stone-950 shadow-[2px_2px_0_#111312]">Ver carrito &rarr;</Link>
    </div>
  );
}

export default CartOverview;
