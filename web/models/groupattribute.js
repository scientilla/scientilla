/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('groupattribute', {
    researchEntity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'group',
        key: 'id'
      }
    },
    attribute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attribute',
        key: 'id'
      }
    },
    extra: {
      type: DataTypes.JSON,
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
    tableName: 'groupattribute'
  });
};
