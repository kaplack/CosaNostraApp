import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import Button from '../../ui/Button';
import { normalizeOrderId } from '../../utils/helpers';

function TrackOrder() {
  const error = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h2 className="mb-3 text-2xl font-semibold">Sigue tu pedido</h2>
      <p className="mb-8 text-sm text-stone-600">
        Ingresa el codigo que recibiste al confirmar tu pedido.
      </p>

      <Form method="POST" className="space-y-4 rounded-md border border-stone-200 p-5">
        <div className="space-y-2">
          <label htmlFor="orderId" className="text-sm font-semibold">
            Codigo de pedido
          </label>
          <input
            id="orderId"
            name="orderId"
            placeholder="Ej. CEE609"
            className="input w-full uppercase"
          />
          {error && (
            <p className="rounded-md bg-red-100 p-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <Button disabled={isSubmitting} type="small">
          {isSubmitting ? 'Buscando pedido' : 'Ver seguimiento'}
        </Button>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const orderId = normalizeOrderId(formData.get('orderId'));

  if (!orderId) return 'Ingresa el codigo de tu pedido.';

  return redirect(`/order/${orderId}`);
}

export default TrackOrder;
