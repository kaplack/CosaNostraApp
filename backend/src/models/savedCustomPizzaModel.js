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
    slug: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_public',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at',
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
    slug: plain.slug,
    isPublic: plain.isPublic,
    publishedAt: plain.publishedAt?.toISOString() || null,
    isActive: plain.isActive,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'pizza';
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

export async function setSavedPizzaPublication(userId, id, isPublic) {
  const pizza = await SavedCustomPizza.findOne({ where: { id, userId, isActive: true } });
  if (!pizza) return null;

  pizza.isPublic = isPublic;
  if (isPublic) {
    if (!pizza.slug) pizza.slug = `${slugify(pizza.name)}-${pizza.id}`;
    pizza.publishedAt = new Date();
  }
  await pizza.save();

  return mapSavedPizza(pizza);
}

export async function findPublicSavedPizzaBySlug(slug) {
  const pizza = await SavedCustomPizza.findOne({
    where: { slug, isPublic: true, isActive: true },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'publicName', 'creatorSlug'],
      where: { isActive: true },
    }],
  });
  if (!pizza) return null;

  const mapped = mapSavedPizza(pizza);
  const plain = pizza.get({ plain: true });
  return {
    ...mapped,
    creator: {
      id: plain.user.id,
      publicName: plain.user.publicName,
      slug: plain.user.creatorSlug,
    },
  };
}

export async function findPublicCreatorBySlug(slug) {
  const creator = await User.findOne({
    where: { creatorSlug: slug, isActive: true, role: 'customer' },
    attributes: ['id', 'publicName', 'creatorSlug'],
  });
  if (!creator) return null;

  const pizzas = await SavedCustomPizza.findAll({
    where: { userId: creator.id, isPublic: true, isActive: true },
    order: [['publishedAt', 'DESC']],
  });

  return {
    creator: {
      id: creator.id,
      publicName: creator.publicName,
      slug: creator.creatorSlug,
    },
    pizzas: pizzas.map(mapSavedPizza),
  };
}

export async function findPublicCommunityPizzas(limit = 24) {
  const pizzas = await SavedCustomPizza.findAll({
    where: { isPublic: true, isActive: true },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'publicName', 'creatorSlug'],
      where: { isActive: true, role: 'customer' },
    }],
    order: [['publishedAt', 'DESC']],
    limit,
  });

  return pizzas.map((pizza) => {
    const mapped = mapSavedPizza(pizza);
    const plain = pizza.get({ plain: true });
    return {
      ...mapped,
      creator: {
        id: plain.user.id,
        publicName: plain.user.publicName,
        slug: plain.user.creatorSlug,
      },
    };
  });
}
