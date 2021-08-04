'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserRole.init({
    user_id: DataTypes.BIGINT,
    role_id: DataTypes.BIGINT,
    restrictable_type: DataTypes.STRING,
    restrictable_id: DataTypes.BIGINT,
    assigned_at: DataTypes.DATE,
    removed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserRole',
    timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
    tableName: 'user_roles',
  });
  return UserRole;
};