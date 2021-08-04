const api = require('../misc/api')
const { BadRequest, ApiException } = require('../misc/exceptions')
const sUser = require('../services/usersService')

module.exports = {
	//External Interface
	search: async (req, res, next) => {
		try {
			var data = req.body;
			const results = await sUser.search(data)
			res.send(api.success('Users', results.data, results.pagination))
		} catch (err) {
			next(err)
		}
	},
	store: async (req, res, next) => {
		try {
			var data = req.body;
			const user = await sUser.store(data);
			res.send(api.success('User created successfully', user.dataValues));
		} catch (err) {
			next(err);
		}
	},
	update: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("User id is required")
			}
			var data = req.body;
			const user = await sUser.update(req.params.id, data);
			res.send(api.success('User updated successfully', user.dataValues));
		} catch (err) {
			next(err);
		}
	},
	show: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("User id is required")
			}
			const user = await sUser.show(req.params.id);
			res.send(api.success('User details', user));
		} catch (err) {
			next(err);
		}
	},
	remove: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("User id is required")
			}
			const user = await sUser.delete(req.params.id);
			res.send(api.success('User deleted successfully', user));
		} catch (err) {
			next(err);
		}
	},
}