import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { getObjectSignedUrl } from '../services/s3Service.js';

export const INGREDIENT_CATEGORIES = [
  'base',
  'sauce',
  'cheese',
  'protein',
  'vegetable',
  'extra',
];
export const INGREDIENT_UNITS = ['gr', 'ml', 'unit'];
export const INGREDIENT_VISUAL_MODES = ['layer', 'scatter'];

export const Ingredient = sequelize.define(
  'Ingredient',
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
    category: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { isIn: [INGREDIENT_CATEGORIES] },
    },
    unit: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { isIn: [INGREDIENT_UNITS] },
    },
    portionQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'portion_quantity',
      validate: { min: 0 },
    },
    costPerPortion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'cost_per_portion',
      validate: { min: 0 },
    },
    pricePerPortion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'price_per_portion',
      validate: { min: 0 },
    },
    maxPortions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      field: 'max_portions',
      validate: { min: 1 },
    },
    visualMode: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'scatter',
      field: 'visual_mode',
      validate: { isIn: [INGREDIENT_VISUAL_MODES] },
    },
    spritesPerPortion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'sprites_per_portion',
      validate: { min: 0 },
    },
    visualSizeCm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'visual_size_cm',
      validate: { min: 0 },
    },
    supportsPartialArea: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'supports_partial_area',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'image_url',
    },
    imageKey: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'image_key',
    },
    selectorImageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'selector_image_url',
    },
    selectorImageKey: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'selector_image_key',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_available',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'ingredients',
    underscored: true,
  }
);

async function mapIngredient(ingredient) {
  const plain = ingredient.get({ plain: true });
  const costPerPortion = Number(plain.costPerPortion);
  const pricePerPortion = Number(plain.pricePerPortion);
  const margin = pricePerPortion - costPerPortion;
  const [imageUrl, selectorImageUrl] = await Promise.all([
    plain.imageKey ? getObjectSignedUrl(plain.imageKey) : plain.imageUrl,
    plain.selectorImageKey
      ? getObjectSignedUrl(plain.selectorImageKey)
      : plain.selectorImageUrl,
  ]);

  return {
    id: plain.id,
    name: plain.name,
    category: plain.category,
    unit: plain.unit,
    portionQuantity: Number(plain.portionQuantity),
    costPerPortion,
    pricePerPortion,
    margin,
    marginPercent: pricePerPortion > 0 ? margin / pricePerPortion : 0,
    maxPortions: plain.maxPortions,
    visualMode: plain.visualMode,
    spritesPerPortion: plain.spritesPerPortion,
    visualSizeCm:
      plain.visualSizeCm === null || plain.visualSizeCm === undefined
        ? null
        : Number(plain.visualSizeCm),
    supportsPartialArea: plain.supportsPartialArea,
    imageUrl,
    imageKey: plain.imageKey,
    selectorImageUrl,
    selectorImageKey: plain.selectorImageKey,
    isAvailable: plain.isAvailable,
    isActive: plain.isActive,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

export async function findAdminIngredients(filters = {}) {
  const where = {};

  if (filters.category) where.category = filters.category;
  if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const ingredients = await Ingredient.findAll({
    where,
    order: [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  return Promise.all(ingredients.map(mapIngredient));
}

export async function findBuilderIngredients() {
  const ingredients = await Ingredient.findAll({
    where: { isActive: true, isAvailable: true },
    order: [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  return Promise.all(ingredients.map(mapIngredient));
}

export async function findIngredientsByIds(ids) {
  if (!ids.length) return [];

  const ingredients = await Ingredient.findAll({
    where: { id: { [Op.in]: ids } },
  });

  return Promise.all(ingredients.map(mapIngredient));
}

export async function createIngredient(payload) {
  return mapIngredient(await Ingredient.create(payload));
}

export async function updateIngredient(id, payload) {
  const ingredient = await Ingredient.findByPk(id);
  if (!ingredient) return null;

  Object.assign(ingredient, payload);
  await ingredient.save();

  return mapIngredient(ingredient);
}

export async function findIngredientInstance(id) {
  return Ingredient.findByPk(id);
}
