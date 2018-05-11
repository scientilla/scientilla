/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sourcemetricsource', {
    sourceMetric: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sourcemetric',
        key: 'id'
      }
    },
    source: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'source',
        key: 'id'
      }
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
    tableName: 'sourcemetricsource'
  });
};
