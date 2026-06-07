import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AttendanceAttributes {
  id: string;
  member_id: string;
  check_in: Date;
  check_out: Date | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceCreationAttributes
  extends Optional<AttendanceAttributes, 'id' | 'check_out' | 'notes'> {}

class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  public id!: string;
  public member_id!: string;
  public check_in!: Date;
  public check_out!: Date | null;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
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
    check_in: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    check_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Attendances',
    modelName: 'Attendance',
    indexes: [{ fields: ['member_id'] }, { fields: ['check_in'] }],
  }
);

export default Attendance;
