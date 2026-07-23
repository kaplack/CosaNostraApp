import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiMapPin, FiShoppingBag, FiUser } from 'react-icons/fi';
import { GiFullPizza } from 'react-icons/gi';
import {
  clearCustomerSession,
  getStoredCustomer,
} from '../../services/apiCustomerAuth';

function CustomerNav({ variant = 'desktop', onNavigate }) {
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

  if (variant === 'mobileMenu') {
    if (!customer) {
      return (
        <div className="grid grid-cols-2 gap-2 border-t-[3px] border-stone-950 pt-3">
          <Link
            to="/login"
            onClick={onNavigate}
            className="border-2 border-stone-950 bg-[#fff8e8] px-3 py-3 text-center text-xs font-black uppercase shadow-[2px_2px_0_#111312]"
          >
            Ingresar
          </Link>
          <Link
            to="/register"
            onClick={onNavigate}
            className="border-2 border-stone-950 bg-[#d7261e] px-3 py-3 text-center text-xs font-black uppercase text-white shadow-[2px_2px_0_#111312]"
          >
            Crear cuenta
          </Link>
        </div>
      );
    }

    return (
      <div className="border-t-[3px] border-stone-950 pt-3">
        <div className="mb-2 bg-stone-950 px-3 py-2 text-[#f9bd16]">
          <p className="text-[10px] font-black uppercase tracking-[0.18em]">Mi cuenta</p>
          <p className="truncate text-sm font-bold text-white">{customer.name}</p>
        </div>
        <div className="grid gap-2">
          <Link to="/account/orders" onClick={onNavigate} className="flex items-center gap-3 border-2 border-stone-950 bg-[#fff8e8] px-3 py-2 text-sm font-bold uppercase">
            <FiShoppingBag aria-hidden="true" /> Mis pedidos
          </Link>
          <Link to="/account/pizzas" onClick={onNavigate} className="flex items-center gap-3 border-2 border-stone-950 bg-[#fff8e8] px-3 py-2 text-sm font-bold uppercase">
            <GiFullPizza aria-hidden="true" /> Mis pizzas
          </Link>
          <Link to="/account/addresses" onClick={onNavigate} className="flex items-center gap-3 border-2 border-stone-950 bg-[#fff8e8] px-3 py-2 text-sm font-bold uppercase">
            <FiMapPin aria-hidden="true" /> Mis direcciones
          </Link>
          <button
            type="button"
            onClick={() => {
              clearCustomerSession();
              setCustomer(null);
              onNavigate?.();
            }}
            className="flex items-center justify-center gap-3 border-2 border-stone-950 bg-[#d7261e] px-3 py-2 text-sm font-black uppercase text-white shadow-[2px_2px_0_#111312]"
          >
            <FiLogOut aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <Link
        to="/login"
        className="inline-flex h-10 w-10 items-center justify-center border-2 border-stone-950 bg-[#fff8e8] text-stone-950 shadow-[2px_2px_0_#111312] transition hover:-translate-y-0.5"
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
          className="inline-flex h-10 w-10 items-center justify-center border-2 border-stone-950 bg-[#fff8e8] text-stone-950 shadow-[2px_2px_0_#111312] transition hover:-translate-y-0.5"
          aria-label="Abrir menu de usuario"
          aria-expanded={isOpen}
          title="Mi cuenta"
        >
          <FiUser aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-40 mt-3 w-64 border-[3px] border-stone-950 bg-[#fff8e8] p-2 text-sm normal-case text-stone-800 shadow-[5px_5px_0_#111312]">
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
        className="inline-flex h-10 w-10 items-center justify-center border-2 border-stone-950 bg-[#d7261e] text-white shadow-[2px_2px_0_#111312] transition hover:-translate-y-0.5"
        aria-label="Cerrar sesion"
        title="Salir"
      >
        <FiLogOut aria-hidden="true" />
      </button>
    </div>
  );
}

export default CustomerNav;
