const { BadRequest, ApiException, NotFound } = require("../misc/exceptions");
const queries = require("../misc/queries");
const { Message, User, Channel } = require("../models");

module.exports = {
    store: async (data) => {
        const rules = {
            user_id: 'required|integer',
            channel_id: 'required|integer',
            content: 'required|text'
        };

        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err)
        })

        data.status = 'active';
        const message = await Message.create(data)

        return message;
    }
}
