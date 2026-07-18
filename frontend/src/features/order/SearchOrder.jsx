import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { normalizeOrderId } from '../../utils/helpers';

function SearchOrder({ fullWidth = false }) {
  const [query, setQuery] = useState('');
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
    <form onSubmit={handleSubmit} className="relative">
      <input
        placeholder="Codigo de pedido"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`rounded-full bg-yellow-100 py-2 pl-3 pr-10 text-sm transition-all duration-300 placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-500 focus:ring-opacity-50 sm:pl-4 ${
          fullWidth ? 'w-full' : 'w-24 sm:w-64 sm:focus:w-72'
        }`}
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-700 transition hover:bg-yellow-200 hover:text-stone-950"
        aria-label="Buscar pedido"
        title="Buscar pedido"
      >
        <FiSearch aria-hidden="true" />
      </button>
    </form>
  );
}

export default SearchOrder;
