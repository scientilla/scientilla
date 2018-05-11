/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('authorshipgroup', {
    researchEntity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'group',
        key: 'id'
      }
    },
    document: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'document',
        key: 'id'
      }
    },
    public: {
      type: DataTypes.BOOLEAN,
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
    synchronize: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'authorshipgroup'
  });
};
