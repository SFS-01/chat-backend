const { isArray } = require('lodash');
const api = require('../misc/api')
const { BadRequest, ApiException } = require('../misc/exceptions')
const sChannel = require('../services/channelService')

module.exports = {
	//External Interface
	search: async (req, res, next) => {
		try {
			var data = req.body;
			const results = await sChannel.search(data)
			res.send(api.success('Channels', results.data, results.pagination))
		} catch (err) {
			next(err)
		}
	},
	store: async (req, res, next) => {
		try {
			var data = req.body;
			const channel = await sChannel.store(data);
			res.send(api.success('Channel created successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	update: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("Channel id is required")
			}
			var data = req.body;
			const channel = await sChannel.update(req.params.id, data);
			res.send(api.success('Channel updated successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	show: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("Channel id is required")
			}
			const channel = await sChannel.show(req.params.id);
			res.send(api.success('Channel details', channel));
		} catch (err) {
			next(err);
		}
	},
	remove: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("Channel id is required")
			}
			const channel = await sChannel.delete(req.params.id);
			res.send(api.success('Channel deleted successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	addUsers: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("Channel id is required")
			}
			var data = req.body;
			const channel = await sChannel.addUsers(req.params.id, data);
			res.send(api.success('Users added to channel successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	removeUsers: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new BadRequest("Channel id is required")
			}
			var data = req.body;
			const channel = await sChannel.removeUsers(req.params.id, data);
			res.send(api.success('Users removed from channel successfully', channel));
		} catch (err) {
			next(err);
		}
	},


	//Internal Interface
	storeInternal: async (req, res, next) => {
		try {
			var data = req.body;
			const rules = {
				user_id: 'required|integer',
				participants: 'array|min:1',
				status: 'string|required'
			}
			var fail = await helpers.validationFail(data, rules).catch(err => {
				throw new BadRequest(err);
			});
			if (data.type == 'public') {
				if (!data.name) {
					throw new BadRequest("Channel name is required")
				}
			} else if (data.type == 'private') {
				if (!data.participants || !Array.isArray(data.participants) || data.participants.length == 0) {
					throw new BadRequest("Channel participants are required")
				}
			}
			const channel = await sChannel.storeInternal(data);
			res.send(api.success('Channel created successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	updateInternal: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Channel id is required")
		}
		try {
			var data = req.body;
			const channel = await sChannel.updateInternal(req.params.id, data);
			res.send(api.success('Channel updated successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	showInternal: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Channel id is required")
		}
		try {
			const channel = await sChannel.showInternal(req.params.id);
			res.send(api.success('Channel', channel));
		} catch (err) {
			next(err);
		}
	},
	deleteInternal: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Channel id is required")
		}
		try {
			const channel = await sChannel.deleteInternal(req.params.id);
			res.send(api.success('Channel removed successfully', channel));
		} catch (err) {
			next(err);
		}
	},
	getParticipants: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Channel id is required")
		}
		try {
			const channel_with_participants = await sChannel.getParticipants(req.params.id);
			res.send(api.success('Channel participants', channel_with_participants));
		} catch (err) {
			next(err);
		}
	},
	getMessages: async (req, res, next) => {
		if (!req.params.id) {
			throw new BadRequest("Channel id is required")
		}
		try {
			const messages = await sChannel.getMessages(req.params.id, req.query);
			res.send(api.success('Channel messages', messages));
		} catch (err) {
			next(err);
		}
	},
}