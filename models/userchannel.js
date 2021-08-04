'use strict';

const { User, Channel } = require("../models");

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserChannel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserChannel.init({
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    channel_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: Channel,
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserChannel',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'user_channel'
  });
  return UserChannel;
};