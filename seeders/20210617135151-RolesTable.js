'use strict';

const {Role} = require("../models");

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
    var roles = await Role.findAll();

    if(roles.length == 0){
      return await queryInterface.bulkInsert('roles', [
        {
          name: 'admin',
          label: 'Admin',
          url: '/',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'support',
          label: 'Support',
          url: '/',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'participant',
          label: 'Participant',
          url: '/',
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

    return await queryInterface.bulkDelete('roles', null, {});
  }
};
