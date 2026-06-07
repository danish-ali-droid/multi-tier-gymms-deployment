import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TrainerAttributes {
  id: string;
  user_id: string;
  specialization: string[];
  experience_years: number;
  bio: string | null;
  certifications: string[];
  hourly_rate: number | null;
  is_available: boolean;
  rating: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TrainerCreationAttributes
  extends Optional<
    TrainerAttributes,
    'id' | 'bio' | 'certifications' | 'hourly_rate' | 'is_available' | 'rating'
  > {}

class Trainer
  extends Model<TrainerAttributes, TrainerCreationAttributes>
  implements TrainerAttributes
{
  public id!: string;
  public user_id!: string;
  public specialization!: string[];
  public experience_years!: number;
  public bio!: string | null;
  public certifications!: string[];
  public hourly_rate!: number | null;
  public is_available!: boolean;
  public rating!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Trainer.init(
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
    specialization: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 60 },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    certifications: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: { min: 0, max: 5 },
    },
  },
  {
    sequelize,
    tableName: 'Trainers',
    modelName: 'Trainer',
    indexes: [{ fields: ['user_id'] }, { fields: ['is_available'] }],
  }
);

export default Trainer;
