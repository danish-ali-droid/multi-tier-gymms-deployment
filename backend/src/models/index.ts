import sequelize from '../config/database';
import User from './User';
import Member from './Member';
import Trainer from './Trainer';
import Payment from './Payment';
import Attendance from './Attendance';

// Define associations
User.hasOne(Member, { foreignKey: 'user_id', as: 'memberProfile' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Trainer, { foreignKey: 'user_id', as: 'trainerProfile' });
Trainer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Member.hasMany(Payment, { foreignKey: 'member_id', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Member.hasMany(Attendance, { foreignKey: 'member_id', as: 'attendances' });
Attendance.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

export { sequelize, User, Member, Trainer, Payment, Attendance };
