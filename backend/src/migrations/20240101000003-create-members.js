module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Members', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      membership_type: {
        type: Sequelize.ENUM('basic', 'standard', 'premium', 'vip'),
        allowNull: false,
        defaultValue: 'basic',
      },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended', 'expired'),
        allowNull: false,
        defaultValue: 'active',
      },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      emergency_contact: { type: Sequelize.STRING(100), allowNull: true },
      health_notes: { type: Sequelize.TEXT, allowNull: true },
      assigned_trainer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Trainers', key: 'id' },
        onDelete: 'SET NULL',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('Members', ['user_id']);
    await queryInterface.addIndex('Members', ['status']);
    await queryInterface.addIndex('Members', ['membership_type']);
    await queryInterface.addIndex('Members', ['end_date']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Members');
  },
};
