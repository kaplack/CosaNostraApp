import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import {
  createAdminIngredient,
  getAdminIngredients,
  updateAdminIngredient,
  uploadAdminIngredientImage,
} from '../../services/apiAdminBuilder';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import Button from '../../ui/Button';

const categories = [
  ['base', 'Masa/base'],
  ['sauce', 'Salsa'],
  ['cheese', 'Queso'],
  ['protein', 'Proteina'],
  ['vegetable', 'Vegetal'],
  ['extra', 'Extra'],
];
const units = ['gr', 'ml', 'unit'];
const visualModes = [
  ['layer', 'Capa'],
  ['scatter', 'Disperso'],
];

const emptyForm = {
  name: '',
  category: 'protein',
  unit: 'gr',
  portionQuantity: '',
  costPerPortion: '',
  pricePerPortion: '',
  maxPortions: '3',
  visualMode: 'scatter',
  spritesPerPortion: '1',
  visualSizeCm: '4.5',
  supportsPartialArea: true,
  imageUrl: '',
  isAvailable: true,
  isActive: true,
};

function ingredientToForm(ingredient) {
  return {
    name: ingredient.name,
    category: ingredient.category,
    unit: ingredient.unit,
    portionQuantity: String(ingredient.portionQuantity),
    costPerPortion: String(ingredient.costPerPortion),
    pricePerPortion: String(ingredient.pricePerPortion),
    maxPortions: String(ingredient.maxPortions),
    visualMode: ingredient.visualMode,
    spritesPerPortion: String(ingredient.spritesPerPortion),
    visualSizeCm:
      ingredient.visualSizeCm === null || ingredient.visualSizeCm === undefined
        ? ''
        : String(ingredient.visualSizeCm),
    supportsPartialArea: ingredient.supportsPartialArea,
    imageUrl: ingredient.imageUrl || '',
    isAvailable: ingredient.isAvailable,
    isActive: ingredient.isActive,
  };
}

function formatCategory(category) {
  return categories.find(([value]) => value === category)?.[1] || category;
}

function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ category: '', isAvailable: '' });
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const currentMargin = useMemo(() => {
    const price = Number(form.pricePerPortion);
    const cost = Number(form.costPerPortion);
    if (!Number.isFinite(price) || !Number.isFinite(cost)) return null;

    return {
      value: price - cost,
      percent: price > 0 ? (price - cost) / price : 0,
    };
  }, [form.costPerPortion, form.pricePerPortion]);

  const loadIngredients = useCallback(async function () {
    try {
      setStatus('loading');
      setError('');
      setIngredients(await getAdminIngredients(filters));
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [filters]);

  useEffect(
    function () {
      loadIngredients();
    },
    [loadIngredients],
  );

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function startEdit(ingredient) {
    setEditingIngredient(ingredient);
    setForm(ingredientToForm(ingredient));
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingIngredient(null);
    setForm(emptyForm);
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      portionQuantity: Number(form.portionQuantity),
      costPerPortion: Number(form.costPerPortion),
      pricePerPortion: Number(form.pricePerPortion),
      maxPortions: Number(form.maxPortions),
      spritesPerPortion: Number(form.spritesPerPortion),
      visualSizeCm:
        form.visualSizeCm === '' || form.visualMode === 'layer'
          ? null
          : Number(form.visualSizeCm),
    };

    try {
      setStatus('saving');
      setError('');
      let savedIngredient;

      if (editingIngredient) {
        savedIngredient = await updateAdminIngredient(editingIngredient.id, payload);
      } else {
        savedIngredient = await createAdminIngredient(payload);
      }

      if (imageFile) {
        await uploadAdminIngredientImage(savedIngredient.id, imageFile);
      }
      resetForm();
      await loadIngredients();
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
        <h1 className="mt-2 text-2xl font-semibold">Insumos</h1>
        <p className="text-sm text-stone-500">
          Cada insumo tiene porcion, costo, precio y maximo por pizza.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-md border border-stone-200 p-4"
      >
        <h2 className="text-lg font-semibold">
          {editingIngredient ? `Editar ${editingIngredient.name}` : 'Nuevo insumo'}
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
            <span className="text-sm font-medium">Categoria</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input w-full"
            >
              {categories.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Unidad</span>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="input w-full"
            >
              {units.map((unit) => (
                <option value={unit} key={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Cantidad por porcion</span>
            <input
              name="portionQuantity"
              type="number"
              min="0"
              step="0.01"
              value={form.portionQuantity}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Costo por porcion</span>
            <input
              name="costPerPortion"
              type="number"
              min="0"
              step="0.01"
              value={form.costPerPortion}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Precio venta por porcion</span>
            <input
              name="pricePerPortion"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerPortion}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Maximo porciones</span>
            <input
              name="maxPortions"
              type="number"
              min="1"
              step="1"
              value={form.maxPortions}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Modo visual</span>
            <select
              name="visualMode"
              value={form.visualMode}
              onChange={handleChange}
              className="input w-full"
            >
              {visualModes.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Sprites por porcion</span>
            <input
              name="spritesPerPortion"
              type="number"
              min="0"
              step="1"
              value={form.spritesPerPortion}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Tamano visual cm</span>
            <input
              name="visualSizeCm"
              type="number"
              min="0"
              step="0.1"
              value={form.visualSizeCm}
              onChange={handleChange}
              disabled={form.visualMode === 'layer'}
              className="input w-full disabled:bg-stone-100 disabled:text-stone-400"
            />
          </label>
          <label className="flex items-end gap-2 text-sm">
            <input
              type="checkbox"
              name="supportsPartialArea"
              checked={form.supportsPartialArea}
              onChange={handleChange}
              className="h-5 w-5 accent-yellow-400"
            />
            Permite mitades
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium">URL ilustracion</span>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="input w-full"
            />
          </label>
          <label className="space-y-1 md:col-span-3">
            <span className="text-sm font-medium">Imagen PNG/WebP transparente</span>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-800 hover:file:bg-yellow-300"
            />
            {imageFile && (
              <p className="text-xs text-stone-500">
                Archivo seleccionado: {imageFile.name}
              </p>
            )}
          </label>
        </div>

        {currentMargin && (
          <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-700">
            Margen estimado: PEN {currentMargin.value.toFixed(2)} (
            {(currentMargin.percent * 100).toFixed(1)}%)
          </p>
        )}

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="h-5 w-5 accent-yellow-400"
            />
            Disponible
          </label>
          <label className="flex items-center gap-2 text-sm">
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
            {status === 'saving' ? 'Guardando...' : 'Guardar insumo'}
          </Button>
          {editingIngredient && (
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

      <div className="mb-5 flex flex-wrap gap-3">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm"
        >
          <option value="">Todas las categorias</option>
          {categories.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="isAvailable"
          value={filters.isAvailable}
          onChange={handleFilterChange}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="true">Disponibles</option>
          <option value="false">No disponibles</option>
        </select>
      </div>

      {status === 'loading' ? (
        <p className="text-sm text-stone-500">Cargando insumos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4">Insumo</th>
                <th className="py-3 pr-4">Categoria</th>
                <th className="py-3 pr-4">Porcion</th>
                <th className="py-3 pr-4">Costo</th>
                <th className="py-3 pr-4">Venta</th>
                <th className="py-3 pr-4">Margen</th>
                <th className="py-3 pr-4">Max</th>
                <th className="py-3 pr-4">Visual</th>
                <th className="py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="border-b align-top">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {ingredient.imageUrl ? (
                        <img
                          src={ingredient.imageUrl}
                          alt={ingredient.name}
                          className="h-12 w-12 rounded bg-stone-100 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-stone-100 text-xs text-stone-500">
                          Sin img
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{ingredient.name}</p>
                        <p className="text-xs text-stone-500">
                          {ingredient.isAvailable ? 'Disponible' : 'No disponible'} /{' '}
                          {ingredient.isActive ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {formatCategory(ingredient.category)}
                  </td>
                  <td className="py-3 pr-4">
                    {ingredient.portionQuantity} {ingredient.unit}
                  </td>
                  <td className="py-3 pr-4">
                    PEN {ingredient.costPerPortion.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4">
                    PEN {ingredient.pricePerPortion.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4">
                    PEN {ingredient.margin.toFixed(2)} (
                    {(ingredient.marginPercent * 100).toFixed(1)}%)
                  </td>
                  <td className="py-3 pr-4">{ingredient.maxPortions}</td>
                  <td className="py-3 pr-4">
                    <p>{ingredient.visualMode === 'layer' ? 'Capa' : 'Disperso'}</p>
                    <p className="text-xs text-stone-500">
                      {ingredient.visualMode === 'scatter'
                        ? `${ingredient.spritesPerPortion} sprites/porcion`
                        : 'Imagen como capa'}
                    </p>
                    {ingredient.visualMode === 'scatter' && ingredient.visualSizeCm && (
                      <p className="text-xs text-stone-500">
                        {ingredient.visualSizeCm} cm visual
                      </p>
                    )}
                    <p className="text-xs text-stone-500">
                      {ingredient.supportsPartialArea
                        ? 'Permite mitades'
                        : 'Solo completa'}
                    </p>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(ingredient)}
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

export default AdminIngredients;
