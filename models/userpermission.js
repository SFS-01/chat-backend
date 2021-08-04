'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserPermission.init({
    user_id: DataTypes.BIGINT,
    permission_id: DataTypes.BIGINT,
    restrictable_type: DataTypes.STRING(50),
    restrictable_id: DataTypes.BIGINT,
    assigned_at: DataTypes.DATE,
    removed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserPermission',
    timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
    tableName: 'user_permissions',
  });
  return UserPermission;
};