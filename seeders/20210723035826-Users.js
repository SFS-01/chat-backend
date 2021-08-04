'use strict';
const bcrypt = require('bcrypt');
const config = require('../config/config');
const moment = require('moment');

const { User } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
    */
    var users = await User.findAll();

    if (users.length == 0) {
      await queryInterface.bulkInsert('users', [
        {
          firstname: 'John',
          lastname: 'Doe',
          username: 'jdoe',
          email: 'john@mail.com',
          alternative_email: 'doe@mail.com',
          password: await module.exports.hashPass('testing123'),
          status: "active",
          created_at: moment().format('YYYY-MM-DD H:m:s'),
          updated_at: moment().format('YYYY-MM-DD H:m:s')
        },
        {
          firstname: 'Allison',
          lastname: 'Smith',
          username: 'allison',
          email: 'allison@mail.com',
          alternative_email: 'smith@mail.com',
          password: await module.exports.hashPass('testing123'),
          status: "active",
          created_at: moment().format('YYYY-MM-DD H:m:s'),
          updated_at: moment().format('YYYY-MM-DD H:m:s')
        },
        {
          firstname: 'Rebeca',
          lastname: 'Miller',
          username: 'rebeca',
          email: 'rebeca@mail.com',
          alternative_email: 'miller@mail.com',
          password: await module.exports.hashPass('testing123'),
          status: "active",
          created_at: moment().format('YYYY-MM-DD H:m:s'),
          updated_at: moment().format('YYYY-MM-DD H:m:s')
        },
        {
          firstname: 'Albert',
          lastname: 'AP',
          username: 'albert',
          email: 'albert@mail.com',
          alternative_email: 'jp@mail.com',
          password: await module.exports.hashPass('testing123'),
          status: "active",
          created_at: moment().format('YYYY-MM-DD H:m:s'),
          updated_at: moment().format('YYYY-MM-DD H:m:s')
        },
      ], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },

  hashPass: async (password) => {
    //Encrypting password
    const hashedPass = await new Promise((resolve, reject) => {
      bcrypt.hash(password, config.saltingRounds, function (err, hash) {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          resolve(hash)
        }
      })
    });
    return hashedPass
  },
};
