import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

export type UserRole = 'admin' | 'staff' | 'member' | 'trainer';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  profile_image_url: string | null;
  is_active: boolean;
  last_login: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'profile_image_url' | 'is_active' | 'last_login'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public role!: UserRole;
  public profile_image_url!: string | null;
  public is_active!: boolean;
  public last_login!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to validate password
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  // Exclude sensitive fields when serializing
  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() } as Partial<UserAttributes>;
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'member', 'trainer'),
      allowNull: false,
      defaultValue: 'member',
    },
    profile_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Users',
    modelName: 'User',
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['role'] },
      { fields: ['is_active'] },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  }
);

// Scope to expose password_hash for authentication
User.addScope('withPassword', {
  attributes: {
    include: ['password_hash'],
  },
});

export default User;
