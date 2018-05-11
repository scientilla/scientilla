/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('collaboration', {
    user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fromMonth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fromYear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    toMonth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    toYear: {
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
    tableName: 'collaboration'
  });
};
