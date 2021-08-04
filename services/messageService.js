const { User, Message, File, Channel, Sequelize } = require("../models");
const Op = Sequelize.Op
const bcrypt = require('bcrypt');
const { BadRequest, ApiException, NotFound } = require("../misc/exceptions");
const config = require('../config/config');
const cache = require('memory-cache');
const queries = require("../misc/queries");
let memCache = new cache.Cache();
const sFile = require("./fileService");


module.exports = {
    search: async (data) => {
        var options = await queries.standardize_search(data);
        const results = await queries.findWithPagination(Message, options);
        return results;
    },
    store: async (data) => {
        const message = await Message.create({
            user_id: data.user_id,
            channel_id: data.channel_id,
            content: data.content,
            status: 'active'
        });
        if (message) {
            if (typeof data.files != 'undefined' && data.files.length > 0) {
                const owner_type = 'message';
                const owner_id = message.id;
                data.files.forEach(file => {
                    sFile.store(file, owner_type, owner_id);
                });
            }
            return message;
        }
    },
    update: async (id, data) => {
        if (id > 0) {
            return await Message.findByPk(id)
                .then(async (message) => {
                    if (message) {
                        await message.update(data, { fields: ['content', 'status'] });
                        return message;
                    } else {
                        throw new NotFound("Message Not Found");
                    }
                });
        }
        throw new NotFound("Message Not Found");
    },
    delete: async (id) => {
        if (id > 0) {
            return await Message.findByPk(id)
                .then(async (message) => {
                    if (message) {
                        return message.destroy();
                    } else {
                        throw new NotFound("Message Not Found");
                    }
                });
        }
        throw new NotFound("Message Not Found");
    },
    show: async (id) => {
        if (id > 0) {
            return await Message.findByPk(id, {
                include: [{
                    model: File, attributes:
                        ['id', 'filename', 'uid', 'path'],
                    as: 'files'
                }, {
                    model: Channel, attributes:
                        ['id', 'name', 'description', 'status'],
                    as: 'channel'
                }, {
                    model: User, attributes:
                        ['id', 'firstname', 'lastname', 'username', 'status'],
                    as: 'user'
                }]
            })
                .then(async (message) => {
                    if (message) {
                        return message;
                    } else {
                        throw new NotFound("Message Not Found");
                    }
                });

        } else {
            throw new NotFound("Message Not Found");
        }
    },
}
