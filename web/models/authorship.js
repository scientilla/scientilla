/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    const Authorship = sequelize.define('authorship', {
        researchEntity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'user',
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
        corresponding: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        },
        first_coauthor: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        last_coauthor: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        oral_presentation: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    }, {
        tableName: 'authorship'
    });

    Authorship.associate = models => {
        Authorship.belongsTo(models.User, {foreignKey: 'researchEntity'});
    };

    Authorship.filterFields = (data) => {
        console.log(data);
    };

    return Authorship;
};
