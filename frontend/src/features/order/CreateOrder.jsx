import { useEffect, useState } from 'react';

import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder, uploadPaymentProof } from '../../services/apiRestaurant';
import { getPaymentSettings } from '../../services/apiPaymentSettings';
import { getStoredCustomer } from '../../services/apiCustomerAuth';
import {
  createMyAddress,
  getMyAddresses,
} from '../../services/apiCustomerAddresses';
import Button from '../../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import EmptyCart from '../cart/EmptyCart';
import store from '../../store';
import { formatCurrency } from '../../utils/helpers';
import { fetchAddress } from '../user/userSlice';

const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

const digitalPaymentLabels = {
  yape: 'Yape',
  plin: 'Plin',
};

const MANUAL_ADDRESS = 'manual';

function CreateOrder() {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(MANUAL_ADDRESS);
  const [manualAddress, setManualAddress] = useState('');
  const [manualPosition, setManualPosition] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isSubmitting = navigation.state === 'submitting';
  const [customer] = useState(() => getStoredCustomer());
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);
  const isLoadingAddress = addressStatus === 'loading';

  const formErrors = useActionData();

  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const totalPrice = totalCartPrice;
  const parsedCashAmount = Number(cashAmount);
  const changeAmount =
    paymentMethod === 'cash' && Number.isFinite(parsedCashAmount)
      ? parsedCashAmount - totalPrice
      : null;
  const selectedPaymentSetting = paymentSettings.find(
    (setting) => setting.method === paymentMethod,
  );
  const paymentOptions = [
    { value: 'cash', label: 'Efectivo' },
    ...paymentSettings.map((setting) => ({
      value: setting.method,
      label: setting.displayName || digitalPaymentLabels[setting.method],
    })),
  ];

  useEffect(function () {
    async function loadPaymentSettings() {
      try {
        setPaymentSettings(await getPaymentSettings());
      } catch (err) {
        setPaymentSettingsError(err.message);
      }
    }

    loadPaymentSettings();
  }, []);

  useEffect(
    function () {
      async function loadAddresses() {
        if (!customer) return;

        try {
          const addresses = await getMyAddresses();
          setSavedAddresses(addresses);
          const defaultAddress = addresses.find((item) => item.isDefault);

          if (defaultAddress) {
            setSelectedAddressId(String(defaultAddress.id));
            setManualAddress(defaultAddress.address);
            setManualPosition(defaultAddress.position || '');
          }
        } catch {
          setSavedAddresses([]);
        }
      }

      loadAddresses();
    },
    [customer],
  );

  useEffect(
    function () {
      if (selectedAddressId !== MANUAL_ADDRESS) return;
      if (address) setManualAddress(address);
      if (position) {
        setManualPosition(
          `https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
        );
      }
    },
    [address, position, selectedAddressId],
  );

  useEffect(
    function () {
      if (
        paymentMethod !== 'cash' &&
        !paymentSettings.some((setting) => setting.method === paymentMethod)
      ) {
        setPaymentMethod('cash');
      }
    },
    [paymentMethod, paymentSettings],
  );

  if (!cart.length) return <EmptyCart />;

  function handleSavedAddressChange(e) {
    const nextAddressId = e.target.value;
    setSelectedAddressId(nextAddressId);

    if (nextAddressId === MANUAL_ADDRESS) {
      setManualAddress('');
      setManualPosition('');
      return;
    }

    const selectedAddress = savedAddresses.find(
      (item) => String(item.id) === nextAddressId,
    );
    setManualAddress(selectedAddress?.address || '');
    setManualPosition(selectedAddress?.position || '');
  }

  return (
    <div className="cn-paper min-h-full border-x-[3px] border-stone-950 px-4 py-8 sm:px-8 lg:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-[4px] border-stone-950 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Último paso</p>
          <h1 className="cn-display text-5xl uppercase italic sm:text-6xl">Completa tu pedido</h1>
        </div>
        <div className="border-[3px] border-stone-950 bg-[#f9bd16] px-5 py-3 shadow-[4px_4px_0_#111312]">
          <p className="text-[10px] font-black uppercase">Total</p>
          <p className="text-xl font-black text-[#d7261e]">{formatCurrency(totalPrice)}</p>
        </div>
      </div>

      <Form method="POST" encType="multipart/form-data" className="mx-auto max-w-4xl [&_.input]:rounded-none [&_.input]:border-2 [&_.input]:border-stone-950 [&_.input]:bg-[#fff8e8] [&_.input]:shadow-[2px_2px_0_#111312] [&_label]:font-bold">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Nombre</label>
          <input
            type="text"
            name="customer"
            defaultValue={customer?.name || username}
            required
            className="input grow"
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">WhatsApp</label>
          <div className="grow">
            <input
              type="tel"
              name="phone"
              defaultValue={customer?.phone || ''}
              required
              className="input w-full"
            />
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        {customer && savedAddresses.length > 0 && (
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sm:basis-40">Direccion guardada</label>
            <select
              value={selectedAddressId}
              onChange={handleSavedAddressChange}
              className="input grow"
            >
              {savedAddresses.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label}
                  {item.isDefault ? ' (predeterminada)' : ''}
                </option>
              ))}
              <option value={MANUAL_ADDRESS}>Otra direccion</option>
            </select>
          </div>
        )}

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Direccion</label>
          <div className="grow">
            <input
              type="text"
              name="address"
              disabled={isLoadingAddress}
              required
              className="input w-full"
              value={manualAddress}
              onChange={(e) => {
                setManualAddress(e.target.value);
                setSelectedAddressId(MANUAL_ADDRESS);
              }}
            />
            {formErrors?.address && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.address}
              </p>
            )}
          </div>
          <span className="absolute right-[3px] top-[35px] z-50 sm:right-[3px] sm:top-[3px] md:right-[5px] md:top-[5px]">
            <Button
              disabled={isLoadingAddress}
              type="small"
              onClick={(e) => {
                e.preventDefault();
                dispatch(fetchAddress());
              }}
            >
              Ubicacion
            </Button>
          </span>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Mapa</label>
          <input
            type="text"
            name="position"
            value={addressStatus === 'error' ? errorAddress : manualPosition}
            onChange={(e) => {
              setManualPosition(e.target.value);
              setSelectedAddressId(MANUAL_ADDRESS);
            }}
            className="input grow"
          />
        </div>

        {customer && selectedAddressId === MANUAL_ADDRESS && (
          <div className="mb-8 border-[3px] border-stone-950 bg-[#fff8e8] p-4 shadow-[3px_3px_0_#111312]">
            <label className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-5 w-5 accent-yellow-400"
              />
              Guardar esta direccion para proximos pedidos
            </label>
            {saveAddress && (
              <input
                type="text"
                name="newAddressLabel"
                value={newAddressLabel}
                onChange={(e) => setNewAddressLabel(e.target.value)}
                placeholder="Nombre: casa, trabajo, etc."
                className="input w-full"
              />
            )}
          </div>
        )}

        <div className="mb-8 space-y-4 border-[3px] border-stone-950 bg-[#fff8e8] p-5 shadow-[5px_5px_0_#111312]">
          <h2 className="cn-display text-3xl uppercase">Método de pago</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            {paymentOptions.map(({ value, label }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 border-[3px] border-stone-950 px-4 py-3 text-sm uppercase transition ${paymentMethod === value ? 'bg-[#f9bd16] font-black shadow-[3px_3px_0_#111312]' : 'bg-white'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-5 w-5 accent-yellow-400"
                />
                {label}
              </label>
            ))}
          </div>
          {paymentSettings.length === 0 && (
            <p className="text-xs text-stone-500">
              Los pagos digitales no estan disponibles por ahora.
            </p>
          )}

          {paymentMethod === 'cash' ? (
            <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
              <label className="text-sm font-medium">Paga con</label>
              <div>
                <input
                  type="number"
                  name="cashAmount"
                  min={Math.ceil(totalPrice)}
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  required
                  className="input w-full"
                />
                {changeAmount !== null && cashAmount !== '' && (
                  <p
                    className={`mt-2 text-xs ${
                      changeAmount < 0 ? 'text-red-600' : 'text-stone-500'
                    }`}
                  >
                    {changeAmount < 0
                      ? 'El monto no cubre el total del pedido.'
                      : `Vuelto estimado: ${formatCurrency(changeAmount)}`}
                  </p>
                )}
                {formErrors?.cashAmount && (
                  <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                    {formErrors.cashAmount}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-stone-950 bg-yellow-50 p-4 text-sm">
                {selectedPaymentSetting ? (
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        Paga con {selectedPaymentSetting.displayName}
                      </p>
                      {selectedPaymentSetting.phone && (
                        <p>Numero: {selectedPaymentSetting.phone}</p>
                      )}
                      {selectedPaymentSetting.accountHolder && (
                        <p>Titular: {selectedPaymentSetting.accountHolder}</p>
                      )}
                      <p className="text-xs text-stone-600">
                        Verifica que el pago figure a nombre del titular indicado y
                        luego sube tu comprobante.
                      </p>
                    </div>
                    {selectedPaymentSetting.qrImageUrl && (
                      <img
                        src={selectedPaymentSetting.qrImageUrl}
                        alt={`QR de ${selectedPaymentSetting.displayName}`}
                        className="h-32 w-32 border-[3px] border-stone-950 object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <p>
                    Selecciona este metodo y sube tu comprobante. Confirmaremos
                    el pago antes de aceptar el pedido.
                  </p>
                )}
              </div>
              {paymentSettingsError && (
                <p className="rounded-md bg-red-100 p-2 text-xs text-red-700">
                  {paymentSettingsError}
                </p>
              )}
              <label className="text-sm font-medium">Comprobante</label>
              <input
                type="file"
                name="paymentProof"
                accept="image/png,image/jpeg,image/webp"
                required
                className="block w-full border-2 border-dashed border-stone-950 bg-white p-2 text-sm file:mr-4 file:border-2 file:border-stone-950 file:bg-yellow-400 file:px-4 file:py-2 file:text-sm file:font-black file:uppercase file:text-stone-800 hover:file:bg-yellow-300"
              />
              <p className="text-xs text-stone-500">
                Sube una captura del pago para que podamos revisarlo.
              </p>
              {formErrors?.paymentProof && (
                <p className="rounded-md bg-red-100 p-2 text-xs text-red-700">
                  {formErrors.paymentProof}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <button disabled={isSubmitting || isLoadingAddress} type="submit" className="cn-shadow border-[3px] border-stone-950 bg-[#f9bd16] px-6 py-4 text-sm font-black uppercase transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting
              ? 'Procesando el pedido'
              : `Ordenar ahora por ${formatCurrency(totalPrice)}`}
          </button>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: false,
    cashAmount: data.paymentMethod === 'cash' ? data.cashAmount : null,
  };
  const paymentProof = data.paymentProof;
  const shouldSaveAddress = data.saveAddress === 'on';
  const newAddressLabel = String(data.newAddressLabel || '').trim();
  delete order.paymentProof;
  delete order.saveAddress;
  delete order.newAddressLabel;

  const errors = {};
  const totalCartPrice = getTotalCartPrice(store.getState());
  const totalPrice = totalCartPrice;

  if (!isValidPhone(order.phone))
    errors.phone =
      'Ingresa un numero de WhatsApp valido. Puede que necesitemos contactarte.';
  if (order.paymentMethod === 'cash' && Number(order.cashAmount) < totalPrice) {
    errors.cashAmount = 'El monto en efectivo debe cubrir el total.';
  }
  if (
    ['yape', 'plin'].includes(order.paymentMethod) &&
    (!paymentProof || paymentProof.size === 0)
  ) {
    errors.paymentProof = 'Sube el comprobante de pago.';
  }
  if (shouldSaveAddress && !newAddressLabel) {
    errors.address = 'Agrega un nombre para guardar esta direccion.';
  }

  if (Object.keys(errors).length > 0) return errors;

  const newOrder = await createOrder(order);
  if (shouldSaveAddress) {
    await createMyAddress({
      label: newAddressLabel,
      address: order.address,
      position: order.position,
      isDefault: false,
    });
  }
  if (['yape', 'plin'].includes(order.paymentMethod)) {
    await uploadPaymentProof(newOrder.id, paymentProof);
  }

  store.dispatch(clearCart());
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
