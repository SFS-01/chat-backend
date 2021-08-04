'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class File extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here	
		}
	};
	File.init({
		uid: DataTypes.STRING,
		owner_type: DataTypes.STRING,
		owner_id: DataTypes.INTEGER,
		type: DataTypes.STRING,
		filename: DataTypes.STRING,
		path: DataTypes.STRING,
		file_size: DataTypes.BIGINT.UNSIGNED,
	}, {
		sequelize,
		modelName: 'File',
		paranoid: true,
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
		tableName: 'files'
	});
	return File;
};