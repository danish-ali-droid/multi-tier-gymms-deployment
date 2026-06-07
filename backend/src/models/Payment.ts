import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';

export interface PaymentAttributes {
  id: string;
  member_id: string;
  amount: number;
  payment_date: Date;
  due_date: Date | null;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  description: string | null;
  transaction_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes
  extends Optional<
    PaymentAttributes,
    'id' | 'due_date' | 'description' | 'transaction_id'
  > {}

class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: string;
  public member_id!: string;
  public amount!: number;
  public payment_date!: Date;
  public due_date!: Date | null;
  public status!: PaymentStatus;
  public payment_method!: PaymentMethod;
  public description!: string | null;
  public transaction_id!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Members', key: 'id' },
      onDelete: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'online'),
      allowNull: false,
      defaultValue: 'cash',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'Payments',
    modelName: 'Payment',
    indexes: [
      { fields: ['member_id'] },
      { fields: ['status'] },
      { fields: ['payment_date'] },
    ],
  }
);

export default Payment;
