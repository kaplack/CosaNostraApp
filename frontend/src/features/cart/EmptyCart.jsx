import LinkButton from '../../ui/LinkButton';

function EmptyCart() {
  return (
    <div className="px-4 py-3">
      <LinkButton to="/menu">&larr; Volver al menu</LinkButton>

      <p className="mt-7 font-semibold">
        Tu carrito esta vacio. Agrega una pizza para empezar.
      </p>
    </div>
  );
}

export default EmptyCart;
