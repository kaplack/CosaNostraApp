import { useEffect, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import {
  createAdminPizzaSize,
  getAdminPizzaSizes,
  updateAdminPizzaSize,
} from '../../services/apiAdminBuilder';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import Button from '../../ui/Button';

const emptyForm = {
  name: '',
  diameterCm: '',
  slices: '',
  portionMultiplier: '',
  basePrice: '',
  isActive: true,
};

function sizeToForm(size) {
  return {
    name: size.name,
    diameterCm: String(size.diameterCm),
    slices: String(size.slices),
    portionMultiplier: String(size.portionMultiplier),
    basePrice: String(size.basePrice),
    isActive: size.isActive,
  };
}

function AdminPizzaSizes() {
  const [sizes, setSizes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingSize, setEditingSize] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(function () {
    loadSizes();
  }, []);

  async function loadSizes() {
    try {
      setStatus('loading');
      setError('');
      setSizes(await getAdminPizzaSizes());
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

  function startEdit(size) {
    setEditingSize(size);
    setForm(sizeToForm(size));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingSize(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      diameterCm: Number(form.diameterCm),
      slices: Number(form.slices),
      portionMultiplier: Number(form.portionMultiplier),
      basePrice: Number(form.basePrice),
    };

    try {
      setStatus('saving');
      setError('');
      if (editingSize) {
        await updateAdminPizzaSize(editingSize.id, payload);
      } else {
        await createAdminPizzaSize(payload);
      }
      resetForm();
      await loadSizes();
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
        <h1 className="mt-2 text-2xl font-semibold">Tamanos de pizza</h1>
        <p className="text-sm text-stone-500">
          La masa/base siempre cubre el 100% de la pizza.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-md border border-stone-200 p-4"
      >
        <h2 className="text-lg font-semibold">
          {editingSize ? `Editar ${editingSize.name}` : 'Nuevo tamano'}
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-medium">Nombre</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Diametro cm</span>
            <input
              name="diameterCm"
              type="number"
              min="0"
              step="0.01"
              value={form.diameterCm}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Tajadas</span>
            <input
              name="slices"
              type="number"
              min="1"
              step="1"
              value={form.slices}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Multiplicador</span>
            <input
              name="portionMultiplier"
              type="number"
              min="0"
              step="0.01"
              value={form.portionMultiplier}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Precio base</span>
            <input
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.basePrice}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="flex items-end gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-5 w-5 accent-yellow-400"
            />
            Activo
          </label>
        </div>

        {error && (
          <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button disabled={status === 'saving'} type="small">
            {status === 'saving' ? 'Guardando...' : 'Guardar tamano'}
          </Button>
          {editingSize && (
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
        <p className="text-sm text-stone-500">Cargando tamanos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4">Tamano</th>
                <th className="py-3 pr-4">Diametro</th>
                <th className="py-3 pr-4">Tajadas</th>
                <th className="py-3 pr-4">Multiplicador</th>
                <th className="py-3 pr-4">Base</th>
                <th className="py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.id} className="border-b">
                  <td className="py-3 pr-4">
                    <p className="font-semibold">{size.name}</p>
                    <p className="text-xs text-stone-500">
                      {size.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                  </td>
                  <td className="py-3 pr-4">{size.diameterCm} cm</td>
                  <td className="py-3 pr-4">{size.slices}</td>
                  <td className="py-3 pr-4">{size.portionMultiplier}</td>
                  <td className="py-3 pr-4">PEN {size.basePrice.toFixed(2)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(size)}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default AdminPizzaSizes;
