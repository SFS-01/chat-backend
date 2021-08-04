'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserActivityLog.init({
    user_id: DataTypes.BIGINT,
    name: DataTypes.STRING,
    action: DataTypes.STRING(30),
    description: DataTypes.TEXT,
    subject_type: DataTypes.STRING,
    subject_id: DataTypes.BIGINT,
    ip_address: DataTypes.STRING(20),
    before: DataTypes.JSON,
    after: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'UserActivityLog',
    createdAt: 'created_at',
		updatedAt: 'updated_at',
		tableName: 'user_activity_logs'
  });
  return UserActivityLog;
};