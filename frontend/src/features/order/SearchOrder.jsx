import { useId, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { normalizeOrderId } from '../../utils/helpers';

function SearchOrder({ fullWidth = false }) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const orderId = normalizeOrderId(query);

    if (!orderId) {
      navigate('/order/track');
      return;
    }

    navigate(`/order/${orderId}`);
    setQuery('');
  }

  return (
    <form onSubmit={handleSubmit} className={fullWidth ? 'grid gap-1' : ''}>
      {fullWidth && (
        <label htmlFor={inputId} className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-950">
          Seguir pedido
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          placeholder="Código de pedido"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`bg-[#fff8e8] py-2 pl-3 pr-10 text-sm transition-all duration-300 placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-500 focus:ring-opacity-50 sm:pl-4 ${
            fullWidth
              ? 'w-full border-2 border-stone-950 shadow-[2px_2px_0_#111312]'
              : 'w-24 border-2 border-stone-950 shadow-[2px_2px_0_#111312] sm:w-64 sm:focus:w-72'
          }`}
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-stone-700 transition hover:bg-yellow-200 hover:text-stone-950"
          aria-label="Buscar pedido"
          title="Buscar pedido"
        >
          <FiSearch aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export default SearchOrder;
