import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom';
import { registerCustomer } from '../../services/apiCustomerAuth';
import Button from '../../ui/Button';

function CustomerRegister() {
  const error = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h2 className="mb-2 text-2xl font-semibold">Crear cuenta</h2>
      <p className="mb-6 text-sm text-stone-600">
        Guarda tus pedidos sin perder la opcion de comprar como invitado.
      </p>

      <Form method="POST" className="space-y-4 rounded-md border border-stone-200 p-5">
        <label className="space-y-1">
          <span className="text-sm font-medium">Nombre</span>
          <input name="name" required className="input w-full" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">WhatsApp</span>
          <input name="phone" type="tel" required className="input w-full" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required className="input w-full" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            minLength="6"
            required
            className="input w-full"
          />
        </label>

        {error && (
          <p className="rounded-md bg-red-100 p-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button disabled={isSubmitting} type="small">
            {isSubmitting ? 'Creando...' : 'Crear cuenta'}
          </Button>
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Ya tengo cuenta
          </Link>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData);

  try {
    await registerCustomer(payload);
    return redirect('/account/orders');
  } catch (err) {
    return err.message;
  }
}

export default CustomerRegister;
