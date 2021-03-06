exports.up = function(queryInterface, Sequelize) {
  return queryInterface.createTable('tags', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING,
      unique: true
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });
};

exports.down = function(queryInterface, Sequelize) {
  return queryInterface.dropTable('tags');
};
