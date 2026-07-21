import { useEffect, useMemo, useState } from 'react';
import { Link, redirect, useLoaderData } from 'react-router-dom';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import { getAdminPaymentSettings } from '../../services/apiPaymentSettings';

function getPaymentSettingIssues(setting) {
  const issues = [];

  if (!setting.isActive) return issues;
  if (!setting.accountHolder?.trim()) issues.push('titular');
  if (!setting.phone?.trim() && !setting.qrImageKey) issues.push('numero o QR');

  return issues;
}

function AdminDashboard() {
  const user = useLoaderData();
  const [paymentSettings, setPaymentSettings] = useState([]);

  useEffect(function () {
    async function loadPaymentSettings() {
      try {
        setPaymentSettings(await getAdminPaymentSettings());
      } catch {
        setPaymentSettings([]);
      }
    }

    loadPaymentSettings();
  }, []);

  const incompletePayments = useMemo(
    () =>
      paymentSettings
        .map((setting) => ({
          ...setting,
          issues: getPaymentSettingIssues(setting),
        }))
        .filter((setting) => setting.issues.length > 0),
    [paymentSettings],
  );

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Panel admin</h1>
          <p className="text-sm text-stone-500">
            Sesion iniciada como {user.name}
          </p>
        </div>
      </div>

      {incompletePayments.length > 0 && (
        <div className="mb-6 rounded-md bg-amber-100 p-4 text-sm text-amber-900">
          <p className="font-semibold">Pagos digitales incompletos</p>
          <p>
            Revisa{' '}
            {incompletePayments
              .map((setting) => setting.displayName)
              .join(', ')}{' '}
            antes de mostrarlos en checkout.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-md border border-stone-200 p-5">
          <h2 className="mb-2 font-semibold">Pizzas</h2>
          <p className="text-sm text-stone-500">
            Gestiona carta, precios, disponibilidad e imagenes.
          </p>
          <Link
            to="/admin/pizzas"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Abrir pizzas &rarr;
          </Link>
        </section>

        <section className="rounded-md border border-stone-200 p-5">
          <h2 className="mb-2 font-semibold">Pedidos</h2>
          <p className="text-sm text-stone-500">
            Revisa pedidos, detalle del cliente y cambia estados.
          </p>
          <Link
            to="/admin/orders"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Abrir pedidos &rarr;
          </Link>
        </section>

        <section className="rounded-md border border-stone-200 p-5">
          <h2 className="mb-2 font-semibold">Pagos</h2>
          <p className="text-sm text-stone-500">
            Configura Yape, Plin, titulares y QR visibles en checkout.
          </p>
          <Link
            to="/admin/payments"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Abrir pagos &rarr;
          </Link>
        </section>

        <section className="rounded-md border border-stone-200 p-5">
          <h2 className="mb-2 font-semibold">Tamanos</h2>
          <p className="text-sm text-stone-500">
            Define familiar, personal y multiplicadores de porcion.
          </p>
          <Link
            to="/admin/sizes"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Abrir tamanos &rarr;
          </Link>
        </section>

        <section className="rounded-md border border-stone-200 p-5">
          <h2 className="mb-2 font-semibold">Insumos</h2>
          <p className="text-sm text-stone-500">
            Gestiona porciones, costos, precios y disponibilidad.
          </p>
          <Link
            to="/admin/ingredients"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Abrir insumos &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentAdmin();
    if (!user) return redirect('/admin/login');

    return user;
  } catch {
    clearSession();
    return redirect('/admin/login');
  }
}

export default AdminDashboard;
