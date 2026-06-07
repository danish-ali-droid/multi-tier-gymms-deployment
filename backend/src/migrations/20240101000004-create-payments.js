module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Payments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Members', key: 'id' },
        onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'bank_transfer', 'online'),
        allowNull: false,
        defaultValue: 'cash',
      },
      description: { type: Sequelize.STRING(255), allowNull: true },
      transaction_id: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('Payments', ['member_id']);
    await queryInterface.addIndex('Payments', ['status']);
    await queryInterface.addIndex('Payments', ['payment_date']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Payments');
  },
};
