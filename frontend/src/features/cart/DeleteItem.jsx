import { useDispatch } from 'react-redux';
import { FiTrash2 } from 'react-icons/fi';
import Button from '../../ui/Button';
import { deleteItem } from './cartSlice';

function DeleteItem({ pizzaId, compact = false }) {
  const dispatch = useDispatch();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => dispatch(deleteItem(pizzaId))}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Eliminar del carrito"
        title="Eliminar"
      >
        <FiTrash2 aria-hidden="true" />
      </button>
    );
  }

  return (
    <div>
      <Button type="small" onClick={() => dispatch(deleteItem(pizzaId))}>
        Eliminar
      </Button>
    </div>
  );
}

export default DeleteItem;
