'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.User, {
        through: models.UserChannel,
        as: 'users',
        foreignKey: 'channel_id',
        otherKey: 'user_id',
        hooks: true,
        onDelete: 'cascade'
      });
      this.hasMany(models.Message, {
        as: 'messages',
        foreignKey: 'channel_id'
      });
    }
  };
  Channel.init({
    name: DataTypes.STRING,
    external_id: DataTypes.INTEGER,
    identifier: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Channel',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'channels'
  });
  return Channel;
};