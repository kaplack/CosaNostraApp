import { useState } from 'react';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import Button from '../../ui/Button';
import { loginAdmin } from '../../services/apiAuth';

function AdminLogin() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [email, setEmail] = useState('admin@cosanostra.local');
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Admin Cosa Nostra</h1>
      <p className="mb-8 text-sm text-stone-500">
        Ingresa para gestionar la operacion del restaurante.
      </p>

      <Form method="POST" className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            required
            className="input w-full"
          />
        </div>

        {actionData?.error && (
          <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">
            {actionData.error}
          </p>
        )}

        <Button disabled={isSubmitting} type="primary">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    await loginAdmin({ email, password });
    return redirect('/admin');
  } catch (err) {
    return { error: err.message };
  }
}

export default AdminLogin;
