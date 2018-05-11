/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('affiliation', {
    authorship: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'authorship',
        key: 'id'
      }
    },
    document: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'document',
        key: 'id'
      }
    },
    institute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'institute',
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
    tableName: 'affiliation'
  });
};
