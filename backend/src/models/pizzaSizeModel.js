import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const PizzaSize = sequelize.define(
  'PizzaSize',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    diameterCm: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      field: 'diameter_cm',
      validate: { min: 0 },
    },
    slices: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    portionMultiplier: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
      defaultValue: 1,
      field: 'portion_multiplier',
      validate: { min: 0 },
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'base_price',
      validate: { min: 0 },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'pizza_sizes',
    underscored: true,
  }
);

function mapPizzaSize(size) {
  const plain = size.get({ plain: true });

  return {
    id: plain.id,
    name: plain.name,
    diameterCm: Number(plain.diameterCm),
    slices: plain.slices,
    portionMultiplier: Number(plain.portionMultiplier),
    basePrice: Number(plain.basePrice),
    isActive: plain.isActive,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

export async function ensureDefaultPizzaSizes() {
  await Promise.all(
    [
      {
        name: 'Familiar',
        diameterCm: 34,
        slices: 8,
        portionMultiplier: 1,
        basePrice: 0,
      },
      {
        name: 'Personal',
        diameterCm: 24,
        slices: 4,
        portionMultiplier: 0.5,
        basePrice: 0,
      },
    ].map((size) =>
      PizzaSize.findOrCreate({
        where: { name: size.name },
        defaults: { ...size, isActive: true },
      })
    )
  );
}

export async function findAdminPizzaSizes() {
  const sizes = await PizzaSize.findAll({ order: [['id', 'ASC']] });
  return sizes.map(mapPizzaSize);
}

export async function findActivePizzaSizes() {
  const sizes = await PizzaSize.findAll({
    where: { isActive: true },
    order: [['id', 'ASC']],
  });

  return sizes.map(mapPizzaSize);
}

export async function createPizzaSize(payload) {
  return mapPizzaSize(await PizzaSize.create(payload));
}

export async function updatePizzaSize(id, payload) {
  const size = await PizzaSize.findByPk(id);
  if (!size) return null;

  Object.assign(size, payload);
  await size.save();

  return mapPizzaSize(size);
}
