/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('alias', {
    str: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
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
    tableName: 'alias'
  });
};
