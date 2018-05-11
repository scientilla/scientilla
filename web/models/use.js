/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('use', {
    remoteAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    jsonWebToken: {
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
    tableName: 'use'
  });
};
