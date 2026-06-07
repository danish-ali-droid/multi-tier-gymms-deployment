module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Attendances', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Members', key: 'id' },
        onDelete: 'CASCADE',
      },
      check_in: { type: Sequelize.DATE, allowNull: false },
      check_out: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('Attendances', ['member_id']);
    await queryInterface.addIndex('Attendances', ['check_in']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Attendances');
  },
};
