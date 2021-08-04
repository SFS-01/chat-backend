'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsToMany(models.Role, {
				through: models.UserRole,
				as: 'roles',
				foreignKey: 'user_id',
				otherKey: 'role_id'
			});
			this.belongsToMany(models.Permission, {
				through: models.UserPermission,
				as: 'permissions',
				foreignKey: 'user_id',
				otherKey: 'permission_id'
			});
			this.belongsToMany(models.Channel, {
				through: models.UserChannel,
				as: 'channels',
				foreignKey: 'channel_id',
				otherKey: 'user_id',
				hooks: true,
				onDelete: 'cascade'
			});
			this.hasMany(models.Message, {
				as: 'messages',
				foreignKey: 'user_id'
			});
		}
	};
	User.init({
		external_id: DataTypes.INTEGER,
		firstname: DataTypes.STRING,
		lastname: DataTypes.STRING,
		username: DataTypes.STRING,
		phone: DataTypes.STRING,
		email: DataTypes.STRING,
		alternative_email: DataTypes.STRING,
		organization: DataTypes.STRING,
		password: DataTypes.STRING,
		status: DataTypes.STRING,
		avatar: DataTypes.STRING,
		last_session: DataTypes.DATE,
		email_verified_at: DataTypes.DATE
	}, {
		sequelize,
		modelName: 'User',
		paranoid: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
		tableName: 'users'
	});
	return User;
};