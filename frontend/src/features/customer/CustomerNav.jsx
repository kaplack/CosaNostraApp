import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiMapPin, FiShoppingBag, FiUser } from 'react-icons/fi';
import { GiFullPizza } from 'react-icons/gi';
import {
  clearCustomerSession,
  getStoredCustomer,
} from '../../services/apiCustomerAuth';

function CustomerNav() {
  const location = useLocation();
  const menuRef = useRef(null);
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(
    function () {
      setCustomer(getStoredCustomer());
      setIsOpen(false);
    },
    [location],
  );

  useEffect(function () {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!customer) {
    return (
      <Link
        to="/login"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-stone-900 transition hover:bg-yellow-50"
        aria-label="Ingresar"
        title="Ingresar"
      >
        <FiUser aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-stone-900 transition hover:bg-yellow-50"
          aria-label="Abrir menu de usuario"
          aria-expanded={isOpen}
          title="Mi cuenta"
        >
          <FiUser aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-40 mt-3 w-64 rounded-md border border-stone-200 bg-white p-2 text-sm normal-case text-stone-800 shadow-xl">
            <div className="border-b border-stone-100 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-stone-400">
                Mi cuenta
              </p>
              <p className="font-semibold">{customer.name}</p>
              {customer.email && (
                <p className="truncate text-xs text-stone-500">{customer.email}</p>
              )}
            </div>

            <div className="py-2">
              <Link
                to="/account/orders"
                className="flex items-center gap-3 rounded px-3 py-2 hover:bg-yellow-50"
              >
                <FiShoppingBag aria-hidden="true" />
                Mis pedidos
              </Link>
              <Link
                to="/account/pizzas"
                className="flex items-center gap-3 rounded px-3 py-2 hover:bg-yellow-50"
              >
                <GiFullPizza aria-hidden="true" />
                Mis pizzas
              </Link>
              <Link
                to="/account/addresses"
                className="flex items-center gap-3 rounded px-3 py-2 hover:bg-yellow-50"
              >
                <FiMapPin aria-hidden="true" />
                Mis direcciones
              </Link>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          clearCustomerSession();
          setCustomer(null);
          setIsOpen(false);
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-stone-900 transition hover:bg-yellow-50"
        aria-label="Cerrar sesion"
        title="Salir"
      >
        <FiLogOut aria-hidden="true" />
      </button>
    </div>
  );
}

export default CustomerNav;
