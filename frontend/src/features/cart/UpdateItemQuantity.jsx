import Button from '../../ui/Button';
import { useDispatch } from 'react-redux';
import { FiTrash2 } from 'react-icons/fi';
import { decreaseItemQuantity, increaseItemQuantity } from './cartSlice';
import { deleteItem } from './cartSlice';

function UpdateItemQuantity({ pizzaId, currentQuantity }) {
  const dispatch = useDispatch();
  return (
    <div className="flex items-center gap-1 md:gap-3">
      {currentQuantity <= 1 ? (
        <button
          type="button"
          onClick={() => dispatch(deleteItem(pizzaId))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Eliminar del carrito"
          title="Eliminar"
        >
          <FiTrash2 aria-hidden="true" />
        </button>
      ) : (
        <Button
          type="round"
          onClick={() => dispatch(decreaseItemQuantity(pizzaId))}
        >
          -
        </Button>
      )}
      <span className="text-sm font-medium">{currentQuantity}</span>
      <Button
        type="round"
        onClick={() => dispatch(increaseItemQuantity(pizzaId))}
      >
        +
      </Button>
    </div>
  );
}

export default UpdateItemQuantity;
