import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, NavLink, useLocation } from 'react-router-dom';
import CustomerNav from '../features/customer/CustomerNav';
import SearchOrder from '../features/order/SearchOrder';

function navClass({ isActive }) {
  return `text-xs font-semibold uppercase tracking-wide transition-colors hover:text-stone-950 ${
    isActive ? 'text-stone-950' : 'text-stone-700'
  }`;
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(
    function () {
      setIsMenuOpen(false);
    },
    [location],
  );

  return (
    <header className="border-b border-yellow-500 bg-yellow-400 px-3 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-stone-950 transition hover:bg-yellow-50 md:hidden"
            aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>

          <Link
            to="/"
            className="inline-flex items-center"
            aria-label="Cosa Nostra"
          >
            <img
              src="/Logotipo-oficial.png"
              alt="Cosa Nostra"
              className="h-6 w-auto sm:h-7"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          <NavLink
            to="/builder"
            className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-300 hover:bg-stone-800"
          >
            Crea tu pizza
          </NavLink>
          <NavLink to="/menu" className={navClass}>
            Carta
          </NavLink>
          <NavLink to="/order/track" className={navClass}>
            Pedido
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SearchOrder />
          </div>
          <CustomerNav />
        </div>

        {isMenuOpen && (
          <nav className="order-3 grid w-full gap-2 rounded-md bg-yellow-300 p-2 shadow-sm md:hidden">
            <div className="px-1">
              <SearchOrder fullWidth />
            </div>
            <NavLink
              to="/builder"
              className="rounded-full bg-stone-950 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-yellow-300"
            >
              Crea tu pizza
            </NavLink>
            <NavLink
              to="/menu"
              className="rounded-full bg-yellow-100 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-800"
            >
              Carta
            </NavLink>
            <NavLink
              to="/order/track"
              className="rounded-full bg-yellow-100 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-800"
            >
              Pedido
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
