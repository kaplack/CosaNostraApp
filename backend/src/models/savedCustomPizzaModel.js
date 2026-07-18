import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './userModel.js';

export const SavedCustomPizza = sequelize.define(
  'SavedCustomPizza',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    baseName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'base_name',
    },
    recipe: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    estimatedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'estimated_price',
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
    tableName: 'saved_custom_pizzas',
    underscored: true,
  }
);

User.hasMany(SavedCustomPizza, {
  foreignKey: 'userId',
  as: 'savedCustomPizzas',
  onDelete: 'CASCADE',
});
SavedCustomPizza.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

function mapSavedPizza(savedPizza) {
  const plain = savedPizza.get({ plain: true });

  return {
    id: plain.id,
    userId: plain.userId,
    name: plain.name,
    baseName: plain.baseName,
    recipe: plain.recipe,
    estimatedPrice: Number(plain.estimatedPrice),
    isActive: plain.isActive,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

export async function findSavedCustomPizzas(userId) {
  const pizzas = await SavedCustomPizza.findAll({
    where: { userId, isActive: true },
    order: [['createdAt', 'DESC']],
  });

  return pizzas.map(mapSavedPizza);
}

export async function createSavedCustomPizza(userId, payload) {
  const pizza = await SavedCustomPizza.create({
    userId,
    ...payload,
  });

  return mapSavedPizza(pizza);
}

export async function updateSavedCustomPizza(userId, id, payload) {
  const pizza = await SavedCustomPizza.findOne({ where: { id, userId } });
  if (!pizza) return null;

  Object.assign(pizza, payload);
  await pizza.save();

  return mapSavedPizza(pizza);
}

export async function deleteSavedCustomPizza(userId, id) {
  const pizza = await SavedCustomPizza.findOne({ where: { id, userId } });
  if (!pizza) return null;

  pizza.isActive = false;
  await pizza.save();

  return mapSavedPizza(pizza);
}
