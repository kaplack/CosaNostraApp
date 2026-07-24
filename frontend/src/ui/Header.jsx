import { useEffect, useState } from 'react';
import { FiMenu, FiShoppingCart, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import CustomerNav from '../features/customer/CustomerNav';
import { getTotalCartQuantity } from '../features/cart/cartSlice';
import SearchOrder from '../features/order/SearchOrder';

function navClass({ isActive }) {
  return `border-b-2 px-1 py-2 text-xs font-black uppercase tracking-wider transition-colors hover:border-stone-950 ${
    isActive ? 'border-stone-950 text-stone-950' : 'border-transparent text-stone-800'
  }`;
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const cartQuantity = useSelector(getTotalCartQuantity);

  useEffect(
    function () {
      setIsMenuOpen(false);
    },
    [location],
  );

  return (
    <header className="relative z-30 border-b-[3px] border-stone-950 bg-[#f9bd16] px-3 py-3 sm:px-6">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center justify-self-start border-2 border-stone-950 bg-[#fff8e8] text-xl text-stone-950 shadow-[2px_2px_0_#111312] transition hover:-translate-y-0.5"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>

          <Link to="/" className="inline-flex items-center" aria-label="Cosa Nostra">
            <img src="/Logotipo-oficial.png" alt="Cosa Nostra" className="h-7 w-auto" />
          </Link>

          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center justify-self-end border-2 border-stone-950 bg-[#fff8e8] text-xl text-stone-950 shadow-[2px_2px_0_#111312]"
            aria-label={`Ver carrito${cartQuantity ? `, ${cartQuantity} productos` : ''}`}
          >
            <FiShoppingCart aria-hidden="true" />
            {cartQuantity > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-stone-950 bg-[#d7261e] px-1 text-[10px] font-black text-white">
                {cartQuantity}
              </span>
            )}
          </Link>
        </div>

        <div className="hidden items-center justify-between gap-5 md:flex">
          <Link to="/" className="inline-flex items-center" aria-label="Cosa Nostra">
            <img src="/Logotipo-oficial.png" alt="Cosa Nostra" className="h-9 w-auto" />
          </Link>

          <nav className="flex items-center gap-4">
            <NavLink to="/builder" className="border-2 border-stone-950 bg-stone-950 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-300 shadow-[3px_3px_0_#d7261e] transition hover:-translate-y-0.5">
              Crea tu pizza
            </NavLink>
            <NavLink to="/menu" className={navClass}>Carta</NavLink>
            <NavLink to="/comunidad" className={navClass}>Comunidad</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <SearchOrder />
            <CustomerNav />
          </div>
        </div>

        {isMenuOpen && (
          <nav className="absolute left-3 right-3 top-full mt-3 grid gap-2 border-[3px] border-stone-950 bg-[#f9bd16] p-3 shadow-[6px_6px_0_#111312] sm:left-6 sm:right-6 md:hidden">
            <SearchOrder fullWidth />
            <NavLink to="/builder" className="border-2 border-stone-950 bg-stone-950 px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-yellow-300">
              Crea tu pizza
            </NavLink>
            <NavLink to="/menu" className="border-2 border-stone-950 bg-[#fff8e8] px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-stone-950">Carta</NavLink>
            <NavLink to="/comunidad" className="border-2 border-stone-950 bg-[#fff8e8] px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-stone-950">Comunidad</NavLink>
            <CustomerNav variant="mobileMenu" onNavigate={() => setIsMenuOpen(false)} />
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
