import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom';
import { loginCustomer } from '../../services/apiCustomerAuth';
import Button from '../../ui/Button';

function CustomerLogin() {
  const error = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h2 className="mb-2 text-2xl font-semibold">Ingresar</h2>
      <p className="mb-6 text-sm text-stone-600">
        Tu cuenta es opcional. Puedes seguir pidiendo como invitado.
      </p>

      <Form method="POST" className="space-y-4 rounded-md border border-stone-200 p-5">
        <label className="space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required className="input w-full" />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
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
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <Link to="/register" className="text-sm text-blue-600 hover:underline">
            Crear cuenta
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
    await loginCustomer(payload);
    return redirect('/account/orders');
  } catch (err) {
    return err.message;
  }
}

export default CustomerLogin;
