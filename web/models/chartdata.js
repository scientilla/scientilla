/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chartdata', {
    key: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    value: {
      type: DataTypes.JSON,
      allowNull: true
    },
    researchEntityType: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    researchEntity: {
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
    tableName: 'chartdata'
  });
};
