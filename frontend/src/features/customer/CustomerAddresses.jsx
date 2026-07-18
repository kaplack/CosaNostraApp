import { useEffect, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import {
  createMyAddress,
  deleteMyAddress,
  getMyAddresses,
  updateMyAddress,
} from '../../services/apiCustomerAddresses';
import { getCurrentCustomer } from '../../services/apiCustomerAuth';
import Button from '../../ui/Button';

const emptyForm = {
  label: '',
  address: '',
  position: '',
  isDefault: false,
};

function addressToForm(address) {
  return {
    label: address.label,
    address: address.address,
    position: address.position || '',
    isDefault: address.isDefault,
  };
}

function CustomerAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingAddress, setEditingAddress] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(function () {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setStatus('loading');
      setError('');
      setAddresses(await getMyAddresses());
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function startEdit(address) {
    setEditingAddress(address);
    setForm(addressToForm(address));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingAddress(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setStatus('saving');
      setError('');

      if (editingAddress) {
        await updateMyAddress(editingAddress.id, form);
      } else {
        await createMyAddress(form);
      }

      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  async function markDefault(address) {
    try {
      await updateMyAddress(address.id, { isDefault: true });
      await loadAddresses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAddress(address) {
    try {
      await deleteMyAddress(address.id);
      await loadAddresses();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <Link
          to="/account/orders"
          className="text-sm text-blue-500 hover:underline"
        >
          &larr; Mis pedidos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Mis direcciones</h1>
        <p className="text-sm text-stone-500">
          Guarda varias direcciones y elige una al ordenar.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-md border border-stone-200 p-4"
      >
        <h2 className="text-lg font-semibold">
          {editingAddress ? 'Editar direccion' : 'Nueva direccion'}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Nombre</span>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="Casa, trabajo, etc."
              required
              className="input w-full"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Link de mapa</span>
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
              className="input w-full"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-medium">Direccion</span>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="h-5 w-5 accent-yellow-400"
          />
          Usar como predeterminada
        </label>

        {error && (
          <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button disabled={status === 'saving'} type="small">
            {status === 'saving' ? 'Guardando...' : 'Guardar direccion'}
          </Button>
          {editingAddress && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold text-stone-500 hover:text-stone-800"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {status === 'loading' ? (
        <p className="text-sm text-stone-500">Cargando direcciones...</p>
      ) : addresses.length === 0 ? (
        <p className="rounded-md border border-stone-200 p-4 text-sm text-stone-500">
          Todavia no tienes direcciones guardadas.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-md border border-stone-200 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{address.label}</h2>
                  {address.isDefault && (
                    <p className="text-xs font-semibold text-green-700">
                      Predeterminada
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-stone-700">{address.address}</p>
              {address.position && (
                <a
                  href={address.position}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Abrir mapa
                </a>
              )}
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => startEdit(address)}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Editar
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => markDefault(address)}
                    className="font-semibold text-green-700 hover:underline"
                  >
                    Predeterminada
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAddress(address)}
                  className="font-semibold text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentCustomer();
    if (!user) return redirect('/login');

    return null;
  } catch {
    return redirect('/login');
  }
}

export default CustomerAddresses;
