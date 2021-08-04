const api = require('../misc/api')
const { BadRequest, ApiException } = require('../misc/exceptions')
const sMessage = require('../services/messageService')

module.exports = {
	search: async (req, res, next) => {
		try {
			var data = req.body;
			const results = await sMessage.search(data)
			res.send(api.success('Messages', results.data, results.pagination))
		} catch (err) {
			next(err)
		}
	},
	store: async (req, res, next) => {
		try {
			helpers.multipart(req, async (data) => {
				const rules = {
					user_id: 'required|integer',
					channel_id: 'required|integer',
					content: 'required|string'
				}
				var fail = await helpers.validationFail(data, rules).catch(err => {
					throw new BadRequest(err)
				});
				data.user = res.user;
				const message = await sMessage.store(data);
				res.send(api.success('Message created successfully', message));
			});
		} catch (err) {
			next(err);
		}
	},
	update: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Message id is required")
		}
		const rules = {
			user_id: 'required|integer',
			channel_id: 'required|integer',
			content: 'required|string'
		}
		var data = req.body;
		var fail = await helpers.validationFail(data, rules).catch(err => {
			throw new BadRequest(err)
		});
		try {
			const message = await sMessage.update(req.params.id, data);
			res.send(api.success('Message successfully updated', message));
		} catch (err) {
			next(err);
		}
	},
	show: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Message id is required")
		}
		try {
			const message = await sMessage.show(req.params.id);
			res.send(api.success('Message details', message));
		} catch (err) {
			next(err);
		}
	},
	delete: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Message id is required")
		}
		try {
			const message = await sMessage.delete(req.params.id);
			res.send(api.success('Message successfully deleted', message));
		} catch (err) {
			next(err);
		}
	}
}