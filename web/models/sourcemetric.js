/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sourcemetric', {
    origin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sourceOriginId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    issn: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    eissn: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sourceTitle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    value: {
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
    tableName: 'sourcemetric'
  });
};
