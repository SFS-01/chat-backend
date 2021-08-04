'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.User, {
				through: models.UserPermission,
				as: 'users',
        foreignKey: 'permission_id',
        otherKey: 'user_id'
			})
    }
  };
  Permission.init({
    name: DataTypes.STRING(50),
    label: DataTypes.STRING(50),
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Permission',
    timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
    tableName: 'permissions',
  });
  return Permission;
};