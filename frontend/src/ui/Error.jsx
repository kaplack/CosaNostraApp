import { useRouteError } from 'react-router-dom';
import LinkButton from './LinkButton';

function Error() {
  const error = useRouteError();

  return (
    <div className="px-4 py-6">
      <h1 className="mb-2 text-xl font-semibold">Algo salio mal</h1>
      <p className="mb-4 text-sm text-stone-600">
        {error.data || error.message || 'No pudimos completar la operacion.'}
      </p>
      <LinkButton to="-1">&larr; Volver</LinkButton>
    </div>
  );
}

export default Error;
