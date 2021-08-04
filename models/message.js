'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id'
      });
      this.belongsTo(models.Channel, {
        as: 'channel',
        foreignKey: 'channel_id'
      });
      this.hasMany(models.File, {
        foreignKey: 'owner_id',
        sourceKey: 'id',
        scope: {
          owner_type: 'message'
        },
        as: 'files'
      });
    }
  };
  Message.init({
    user_id: DataTypes.INTEGER,
    channel_id: DataTypes.INTEGER,
    content: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Message',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'messages'
  });
  return Message;
};