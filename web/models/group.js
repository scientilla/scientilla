/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('group', {
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shortname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    publicationsAcronym: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scopusId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    institute: {
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
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    starting_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'group'
  });
};
