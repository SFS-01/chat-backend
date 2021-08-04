'use strict';

const {Permission} = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    var permissions = await Permission.findAll();

    if(permissions.length == 0){
      return await queryInterface.bulkInsert('permissions', [
        {
          name: 'join_channel',
          label: 'Join Channel',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'create_channel',
          label: 'Create Channel',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    } else {
      return true;
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return await queryInterface.bulkDelete('permissions', null, {});
  }
};
