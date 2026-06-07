module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trainers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      specialization: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      experience_years: { type: Sequelize.INTEGER, defaultValue: 0 },
      bio: { type: Sequelize.TEXT, allowNull: true },
      certifications: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      hourly_rate: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      is_available: { type: Sequelize.BOOLEAN, defaultValue: true },
      rating: { type: Sequelize.DECIMAL(3, 2), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('Trainers', ['user_id']);
    await queryInterface.addIndex('Trainers', ['is_available']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Trainers');
  },
};
