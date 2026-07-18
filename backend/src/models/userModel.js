import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define(
  'User',
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
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'admin',
      validate: { isIn: [['admin', 'customer']] },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'users',
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  }
);

export function toPublicUser(user) {
  const plain = user.get({ plain: true });

  return {
    id: plain.id,
    name: plain.name,
    email: plain.email,
    phone: plain.phone,
    role: plain.role,
    isActive: plain.isActive,
  };
}

export async function findUserByEmailWithPassword(email) {
  return User.scope('withPassword').findOne({
    where: { email: email.toLowerCase(), isActive: true },
  });
}

export async function createCustomer({ name, email, phone, passwordHash }) {
  return User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: 'customer',
    isActive: true,
  });
}
