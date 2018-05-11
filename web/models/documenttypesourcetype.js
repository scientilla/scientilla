/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('documenttypesourcetype', {
    documentType: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sourceType: {
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
    tableName: 'documenttypesourcetype'
  });
};
