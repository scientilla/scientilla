/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    const Institute = sequelize.define('institute', {
        name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        country: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        city: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        shortname: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        scopusId: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        group: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        aliasOf: {
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
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'institute'
    });

    return Institute;
};
