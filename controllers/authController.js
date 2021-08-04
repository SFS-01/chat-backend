const api = require('../misc/api')
const { BadRequest, ApiException } = require('../misc/exceptions')
const sAuth = require('../services/authService')
const { QueryTypes } = require('sequelize');
var crypto = require('crypto');

module.exports = {
	//Login Function
    login: async (req, res, next) => {
		try{
			var data = req.body;
			data['creator'] = req.auth
			const user = await sAuth.login(data)
			res.send(api.success('Login successfull', user))
		}catch(err){
			next(err)
		}
    },
	//Signup Function
    signup: async (req, res, next) => {
		try{
			var data = req.body;
			data['creator'] = req.auth
			const user = await sAuth.signup(data)
			res.send(api.success('Signup successfull', user))
		}catch(err){
			next(err)
		}
    },

}