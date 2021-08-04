'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.User, {
				through: models.UserRole,
				as: 'users',
        foreignKey: 'role_id',
        otherKey: 'user_id'
			})
    }
  };
  Role.init({
    name: DataTypes.STRING(50),
    label: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    url: DataTypes.STRING
  }, {
    sequelize,
    timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
    tableName: 'roles',
    modelName: 'Role',
  });
  return Role;
};