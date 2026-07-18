import { useEffect, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import {
  getAdminPaymentSettings,
  updateAdminPaymentSetting,
  uploadAdminPaymentQr,
} from '../../services/apiPaymentSettings';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import Button from '../../ui/Button';

function settingToForm(setting) {
  return {
    displayName: setting.displayName || '',
    phone: setting.phone || '',
    accountHolder: setting.accountHolder || '',
    isActive: setting.isActive,
  };
}

function getPaymentSettingIssues(setting) {
  const issues = [];

  if (!setting.isActive) return issues;
  if (!setting.accountHolder?.trim()) issues.push('Agrega el titular.');
  if (!setting.phone?.trim() && !setting.qrImageKey) {
    issues.push('Agrega un numero o un QR.');
  }

  return issues;
}

function AdminPayments() {
  const [settings, setSettings] = useState([]);
  const [forms, setForms] = useState({});
  const [qrFiles, setQrFiles] = useState({});
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(function () {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setStatus('loading');
      setError('');
      const data = await getAdminPaymentSettings();
      setSettings(data);
      setForms(
        data.reduce(
          (nextForms, setting) => ({
            ...nextForms,
            [setting.method]: settingToForm(setting),
          }),
          {},
        ),
      );
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  function handleChange(method, e) {
    const { name, value, type, checked } = e.target;
    setForms((current) => ({
      ...current,
      [method]: {
        ...current[method],
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  }

  async function handleSubmit(setting, e) {
    e.preventDefault();

    try {
      setStatus('saving');
      setError('');
      await updateAdminPaymentSetting(setting.method, forms[setting.method]);

      if (qrFiles[setting.method]) {
        await uploadAdminPaymentQr(setting.method, qrFiles[setting.method]);
      }

      setQrFiles((current) => ({ ...current, [setting.method]: null }));
      await loadSettings();
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <Link to="/admin" className="text-sm text-blue-500 hover:underline">
          &larr; Panel admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Pagos</h1>
        <p className="text-sm text-stone-500">
          Configura los numeros, titulares y QR que vera el cliente en checkout.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {status === 'loading' ? (
        <p className="text-sm text-stone-500">Cargando medios de pago...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {settings.map((setting) => {
            const form = forms[setting.method] || settingToForm(setting);
            const issues = getPaymentSettingIssues({
              ...setting,
              ...form,
            });

            return (
              <form
                key={setting.method}
                onSubmit={(e) => handleSubmit(setting, e)}
                className="space-y-4 rounded-md border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {setting.displayName}
                    </h2>
                    <p className="text-sm text-stone-500">
                      Metodo {setting.isActive ? 'activo' : 'inactivo'}.
                    </p>
                    {issues.length > 0 && (
                      <p className="mt-2 rounded-md bg-amber-100 p-2 text-xs font-semibold text-amber-800">
                        Configuracion incompleta: {issues.join(' ')}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={(e) => handleChange(setting.method, e)}
                      className="h-5 w-5 accent-yellow-400"
                    />
                    Activo
                  </label>
                </div>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Nombre visible</span>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={(e) => handleChange(setting.method, e)}
                    required
                    className="input w-full"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Numero</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={(e) => handleChange(setting.method, e)}
                    className="input w-full"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-medium">Titular</span>
                  <input
                    name="accountHolder"
                    value={form.accountHolder}
                    onChange={(e) => handleChange(setting.method, e)}
                    className="input w-full"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-medium">QR de pago</span>
                  {setting.qrImageUrl ? (
                    <img
                      src={setting.qrImageUrl}
                      alt={`QR de ${setting.displayName}`}
                      className="h-40 w-40 rounded-md border border-stone-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-md border border-stone-200 bg-stone-100 text-xs text-stone-500">
                      Sin QR
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      setQrFiles((current) => ({
                        ...current,
                        [setting.method]: e.target.files?.[0] || null,
                      }))
                    }
                    className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-800 hover:file:bg-yellow-300"
                  />
                  {qrFiles[setting.method] && (
                    <p className="text-xs text-stone-500">
                      Archivo seleccionado: {qrFiles[setting.method].name}
                    </p>
                  )}
                </div>

                <Button disabled={status === 'saving'} type="small">
                  {status === 'saving' ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentAdmin();
    if (!user) return redirect('/admin/login');

    return null;
  } catch {
    clearSession();
    return redirect('/admin/login');
  }
}

export default AdminPayments;
