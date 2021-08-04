const api = require('../misc/api');
const { BadRequest, ApiException, NotFound } = require('../misc/exceptions');
const manageService = require('../services/manageService');
const roleService = require('../services/roleService');

module.exports = {
    storeList: async (req, res, next) => {
        try{
			var data = req.body;
			data['creator'] = req.auth
			data['user_id'] = req.auth.user.id;
			const list = await manageService.storeList(data)
			res.send(api.success('List created successfully', list))
		}catch(err){
			next(err)
		}
	},
}