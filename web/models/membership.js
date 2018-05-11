/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('membership', {
    user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group: {
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
    lastsynch: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    synchronized: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'membership'
  });
};
