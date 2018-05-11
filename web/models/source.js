/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('source', {
    title: {
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
    acronym: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    year: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    publisher: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isbn: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scopusId: {
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
    },
    sourcetype: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sourcetype',
        key: 'id'
      }
    }
  }, {
    tableName: 'source'
  });
};
