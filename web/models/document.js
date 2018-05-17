/* jshint indent: 2 */

module.exports = (sequelize, DataTypes) => {
    const Document = sequelize.define('document', {
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        authorsStr: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        authorKeywords: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        year: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        issue: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        volume: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        pages: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        articleNumber: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        doi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        type: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        sourceType: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        itSource: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        scopusId: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        wosId: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        abstract: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        source: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'source',
                key: 'id'
            }
        },
        draftCreator: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        draftGroupCreator: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'group',
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
        },
        origin: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        kind: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        iitPublicationsId: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        synchronized: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        documenttype: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        scopus_id_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    }, {
        tableName: 'document'
    });

    Document.associate = models => {
        Document.belongsToMany(models.Institute, {
            as: 'institutes',
            through: 'affiliation',
            foreignKey: 'document',
            otherKey: 'institute'
        });

        Document.belongsToMany(models.User, {
            as: 'authors',
            through: 'authorship',
            foreignKey: 'document',
            otherKey: 'researchEntity'
        });
    };

    Document.verifyDraft = () => {

    };

    return Document;
};
