/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('accesslog', {
    path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    method: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
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
    tableName: 'accesslog'
  });
};
