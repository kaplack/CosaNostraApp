import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { getObjectSignedUrl } from '../services/s3Service.js';

export const MenuItem = sequelize.define(
  'MenuItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price',
      validate: { min: 0 },
    },
    ingredients: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    soldOut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'sold_out',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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
  },
  {
    tableName: 'menu_items',
    underscored: true,
  }
);

async function mapMenuItem(item) {
  const plain = item.get({ plain: true });
  const signedImageUrl = plain.imageKey
    ? await getObjectSignedUrl(plain.imageKey)
    : null;

  return {
    id: plain.id,
    name: plain.name,
    unitPrice: Number(plain.unitPrice),
    ingredients: plain.ingredients,
    soldOut: plain.soldOut,
    isActive: plain.isActive,
    imageUrl: signedImageUrl || plain.imageUrl,
    imageKey: plain.imageKey,
  };
}

export async function findMenuItems() {
  const menuItems = await MenuItem.findAll({
    where: { isActive: true },
    order: [['id', 'ASC']],
  });
  return Promise.all(menuItems.map(mapMenuItem));
}

export async function findAdminMenuItems() {
  const menuItems = await MenuItem.findAll({ order: [['id', 'ASC']] });
  return Promise.all(menuItems.map(mapMenuItem));
}

export async function createMenuItem(data) {
  const menuItem = await MenuItem.create(data);
  return mapMenuItem(menuItem);
}

export async function updateMenuItem(id, data) {
  const menuItem = await MenuItem.findByPk(id);
  if (!menuItem) return null;

  await menuItem.update(data);
  return mapMenuItem(menuItem);
}

export async function deactivateMenuItem(id) {
  return updateMenuItem(id, { isActive: false });
}

export async function findMenuItemInstance(id) {
  return MenuItem.findByPk(id);
}
