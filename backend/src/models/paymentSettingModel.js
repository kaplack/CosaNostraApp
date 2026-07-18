import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { getObjectSignedUrl } from '../services/s3Service.js';

export const PAYMENT_SETTING_METHODS = ['yape', 'plin'];

export const PaymentSetting = sequelize.define(
  'PaymentSetting',
  {
    method: {
      type: DataTypes.TEXT,
      primaryKey: true,
      validate: { isIn: [PAYMENT_SETTING_METHODS] },
    },
    displayName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'display_name',
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    accountHolder: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'account_holder',
    },
    qrImageKey: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'qr_image_key',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'payment_settings',
    underscored: true,
  }
);

async function mapPaymentSetting(setting) {
  if (!setting) return null;

  const plain = setting.get({ plain: true });
  const qrImageUrl = plain.qrImageKey
    ? await getObjectSignedUrl(plain.qrImageKey)
    : null;

  return {
    method: plain.method,
    displayName: plain.displayName,
    phone: plain.phone,
    accountHolder: plain.accountHolder,
    qrImageKey: plain.qrImageKey,
    qrImageUrl,
    isActive: plain.isActive,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

export async function ensureDefaultPaymentSettings() {
  await Promise.all(
    [
      { method: 'yape', displayName: 'Yape' },
      { method: 'plin', displayName: 'Plin' },
    ].map((setting) =>
      PaymentSetting.findOrCreate({
        where: { method: setting.method },
        defaults: {
          ...setting,
          phone: '',
          accountHolder: '',
          qrImageKey: null,
          isActive: true,
        },
      })
    )
  );
}

export async function findPaymentSettings({ activeOnly = false } = {}) {
  const settings = await PaymentSetting.findAll({
    where: activeOnly ? { isActive: true } : undefined,
    order: [
      [
        sequelize.literal("CASE method WHEN 'yape' THEN 0 WHEN 'plin' THEN 1 ELSE 2 END"),
        'ASC',
      ],
    ],
  });

  return Promise.all(settings.map(mapPaymentSetting));
}

export async function findPaymentSetting(method) {
  return mapPaymentSetting(await PaymentSetting.findByPk(method));
}

export async function findPaymentSettingInstance(method) {
  return PaymentSetting.findByPk(method);
}

export async function updatePaymentSetting(method, payload) {
  const setting = await PaymentSetting.findByPk(method);
  if (!setting) return null;

  Object.assign(setting, payload);
  await setting.save();

  return mapPaymentSetting(setting);
}
