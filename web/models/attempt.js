/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attempt', {
    user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    successful: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ip: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    port: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'attempt'
  });
};
