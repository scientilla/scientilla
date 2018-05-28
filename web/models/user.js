/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        username: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        surname: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        slug: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: true
        },
        role: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        orcidId: {
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
        jobTitle: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        alreadyAccess: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        alreadyOpenedSuggested: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
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
        tableName: 'user'
    });

    User.associate = models => {

        User.hasMany(models.Authorship, {
            as: 'authorships',
            foreignKey: 'researchEntity',
            sourceKey: 'id'
        });

        User.belongsToMany(models.Document, {
            as: 'documents',
            through: 'authorship',
            foreignKey: 'researchEntity',
            otherKey: 'document'
        });
    };

    User.prototype.getVerifiedDocuments = function() {

    };

    return User;
};
