import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { User } from './userModel.js';

export const CustomerAddress = sequelize.define(
  'CustomerAddress',
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
    label: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    position: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default',
    },
  },
  {
    tableName: 'customer_addresses',
    underscored: true,
  }
);

User.hasMany(CustomerAddress, {
  foreignKey: 'userId',
  as: 'addresses',
  onDelete: 'CASCADE',
});
CustomerAddress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

function mapAddress(address) {
  const plain = address.get({ plain: true });

  return {
    id: plain.id,
    userId: plain.userId,
    label: plain.label,
    address: plain.address,
    position: plain.position,
    isDefault: plain.isDefault,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

async function clearDefaultAddress(userId, transaction) {
  await CustomerAddress.update(
    { isDefault: false },
    { where: { userId }, transaction }
  );
}

export async function findCustomerAddresses(userId) {
  const addresses = await CustomerAddress.findAll({
    where: { userId },
    order: [
      ['isDefault', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });

  return addresses.map(mapAddress);
}

export async function createCustomerAddress(userId, payload) {
  return sequelize.transaction(async (transaction) => {
    const count = await CustomerAddress.count({ where: { userId }, transaction });
    const isDefault = payload.isDefault || count === 0;

    if (isDefault) await clearDefaultAddress(userId, transaction);

    const address = await CustomerAddress.create(
      {
        userId,
        ...payload,
        isDefault,
      },
      { transaction }
    );

    return mapAddress(address);
  });
}

export async function updateCustomerAddress(userId, id, payload) {
  return sequelize.transaction(async (transaction) => {
    const address = await CustomerAddress.findOne({
      where: { id, userId },
      transaction,
    });
    if (!address) return null;

    if (payload.isDefault) await clearDefaultAddress(userId, transaction);

    Object.assign(address, payload);
    await address.save({ transaction });

    return mapAddress(address);
  });
}

export async function deleteCustomerAddress(userId, id) {
  return sequelize.transaction(async (transaction) => {
    const address = await CustomerAddress.findOne({
      where: { id, userId },
      transaction,
    });
    if (!address) return null;

    const wasDefault = address.isDefault;
    await address.destroy({ transaction });

    if (wasDefault) {
      const nextAddress = await CustomerAddress.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']],
        transaction,
      });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save({ transaction });
      }
    }

    return mapAddress(address);
  });
}
