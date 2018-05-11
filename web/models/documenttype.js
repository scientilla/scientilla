/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('documenttype', {
    key: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shortLabel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultSourceType: {
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
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    highimpact: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'documenttype'
  });
};
