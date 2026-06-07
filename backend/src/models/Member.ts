import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type MembershipType = 'basic' | 'standard' | 'premium' | 'vip';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'expired';

export interface MemberAttributes {
  id: string;
  user_id: string;
  membership_type: MembershipType;
  start_date: Date;
  end_date: Date;
  status: MemberStatus;
  phone: string | null;
  emergency_contact: string | null;
  health_notes: string | null;
  assigned_trainer_id: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MemberCreationAttributes
  extends Optional<
    MemberAttributes,
    'id' | 'phone' | 'emergency_contact' | 'health_notes' | 'assigned_trainer_id'
  > {}

class Member extends Model<MemberAttributes, MemberCreationAttributes> implements MemberAttributes {
  public id!: string;
  public user_id!: string;
  public membership_type!: MembershipType;
  public start_date!: Date;
  public end_date!: Date;
  public status!: MemberStatus;
  public phone!: string | null;
  public emergency_contact!: string | null;
  public health_notes!: string | null;
  public assigned_trainer_id!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Member.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    membership_type: {
      type: DataTypes.ENUM('basic', 'standard', 'premium', 'vip'),
      allowNull: false,
      defaultValue: 'basic',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'expired'),
      allowNull: false,
      defaultValue: 'active',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergency_contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    health_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigned_trainer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Trainers', key: 'id' },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'Members',
    modelName: 'Member',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['membership_type'] },
      { fields: ['end_date'] },
    ],
  }
);

export default Member;
