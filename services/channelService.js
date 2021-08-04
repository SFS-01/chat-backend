const { User, Channel, UserChannel, Message, Sequelize } = require("../models");
const Op = Sequelize.Op
const bcrypt = require('bcrypt');
const { BadRequest, ApiException, NotFound } = require("../misc/exceptions");
const config = require('../config/config');
const cache = require('memory-cache');
const queries = require("../misc/queries");
let memCache = new cache.Cache();


module.exports = {
    //External Interface
    search: async (data) => {
        var options = await queries.standardize_search(data);
        const results = await queries.findWithPagination(Channel, options);
        return results;
    },
    store: async (data) => {
        const rules = {
            id: 'required',
            name: 'required',
            type: 'required|alpha',
            status: 'required|alpha'
        }
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err);
        });
        let current_channel = await Channel.findOne({ where: { external_id: data.id } });
        if (current_channel) {
            throw new BadRequest("This channel already exists", 422);
        }
        data.external_id = data.id;
        console.log(data);
        const channel = await Channel.create(data, { fields: ['name', 'description', 'type', 'status', 'external_id'] });

        return channel;
    },
    update: async (id, data) => {
        const rules = {
            name: 'required'
        }
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err);
        });

        return await Channel.findOne({ where: { external_id: id } })
            .then(async (channel) => {
                if (channel) {
                    await channel.update(data, { fields: ['name', 'description', 'status'] });
                    await channel.reload();

                    return channel;
                } else {
                    throw new NotFound("Channel Not Found");
                }
            });
    },
    delete: async (id) => {
        if (id > 0) {
            return await Channel.findOne({ where: { external_id: id } })
                .then(async (channel) => {
                    if (channel) {
                        let result = await channel.destroy();
                        if (result) {
                            return true;
                        } else {
                            throw new ApiException("Error deleting the channel");
                        }
                    } else {
                        throw new NotFound("Channel Not Found");
                    }
                });

        } else {
            throw new NotFound("Channel Not Found");
        }
    },
    show: async (id) => {
        if (id > 0) {
            return await Channel.findOne({ where: { external_id: id } })
                .then(async (channel) => {
                    if (channel) {
                        return channel;
                    } else {
                        throw new NotFound("Channel Not Found");
                    }
                });

        } else {
            throw new NotFound("Channel Not Found");
        }
    },
    addUsers: async (id, data) => {
        const rules = {
            participants: 'required|array|min:1',
        }
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err);
        });

        if (data.participants.length == 0) {
            throw new BadRequest("At least one user is required");
        }

        return Channel.findOne({ where: { external_id: id } })
            .then((channel) => {
                if (!channel) {
                    throw new NotFound("Channel Not Found");
                }
                let count = 0;
                data.participants.forEach(user_id => {
                    return User.findOne({ where: { external_id: user_id } }).then((user) => {
                        if (!user) {
                            return false;
                        } else {
                            channel.addUser(user);
                            count++;
                        }
                    });
                });
                /* if (count > 0) {
                    console.log("COUNT => ", count)
                    return true;
                } else {
                    throw new BadRequest("Invalid users");
                } */
            })
            .catch((err) => {
                throw new ApiException(err);
            });
    },
    removeUsers: async (id, data) => {
        const rules = {
            participants: 'required|array|min:1'
        }
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err);
        });

        if (data.participants.length == 0) {
            throw new BadRequest("At least one user is required");
        }

        return Channel.findOne({ where: { external_id: id } })
            .then((channel) => {
                if (!channel) {
                    throw new NotFound("Channel Not Found");
                }
                let count = 0;
                data.participants.forEach(user_id => {
                    return User.findOne({ where: { external_id: user_id } }).then((user) => {
                        if (!user) {
                            return null;
                        } else {
                            channel.removeUser(user);
                            count++;
                        }
                    });
                });
                /* if (count > 0) {
                    return true;
                } else {
                    throw new BadRequest("Invalid users");
                } */
            })
            .catch((err) => {
                throw new ApiException(err);
            });
    },

    storeInternal: async (data) => {
        if (data.type == 'public') {
            let current_channel = await Channel.findOne({ where: { name: data.name, type: data.type } });
            if (current_channel) {
                throw new BadRequest("This channel already exists", 422);
            }
            const channel = await Channel.create(data);
            return channel;
        } else if (data.type == 'private') {
            let participants = data.participants;
            participants.push(data.user_id);
            let sorted_ = participants.sort(function (a, b) {
                return a - b;
            });
            let identifier = sorted_.join('.');
            let current_channel = await Channel.findOne({ where: { identifier: identifier } });
            if (current_channel) {
                throw new BadRequest("This channel already exists", 422);
            }
            data.identifier = identifier;

            /* var usernames = [];
            sorted_.forEach(user_id => {
                return User.findByPk(user_id).then( (user) => {
                    if (!user) {
                        return null;
                    } else {
                        usernames.push(user.username)
                    }
                });
            });
            if (usernames.length > 0) {
                data.name = usernames.join(',');
            } */

            const channel = await Channel.create(data);
            if (channel) {
                participants.forEach(user_id => {
                    return User.findByPk(user_id).then((user) => {
                        if (!user) {
                            return false;
                        } else {
                            channel.addUser(user);
                        }
                    }).catch((err) => {
                        throw new ApiException(err);
                    });;
                });
                return channel;
            }
        } else {
            throw new BadRequest("Invalid channel type");
        }

        throw new BadRequest("Error creating the channel");
    },
    updateInternal: async (id, data) => {
        let channel = await Channel.findByPk(id);
        if (!channel) {
            throw new NotFound("Channel not found", 404);
        }
        if (channel.type != 'public') {
            throw new BadRequest("Invalid channel type for updating using this service", 422);
        }
        return await Channel.findByPk(id)
            .then(async (channel) => {
                if (channel) {
                    await channel.update(data, { fields: ['name', 'description', 'status'] });
                    await channel.reload();

                    return channel;
                } else {
                    throw new NotFound("Channel Not Found");
                }
            });
    },
    showInternal: async (id) => {
        if (id > 0) {
            return await Channel.findByPk(id, {
                include: [{
                    model: User, attributes:
                        ['id', 'firstname', 'username', 'lastname', 'email', 'organization', 'avatar'],
                    as: 'users'
                }]
            }).then(async (channel) => {
                if (channel) {
                    return channel;
                } else {
                    throw new NotFound("Channel Not Found");
                }
            });
        } else {
            throw new NotFound("Channel Not Found");
        }
    },
    deleteInternal: async (id) => {
        if (id > 0) {
            return await Channel.findByPk(id).then(async (channel) => {
                if (channel) {
                    if (channel.type != 'private') {
                        throw new BadRequest("Invalid channel type for removing using this service", 422);
                    }
                    if (await channel.countUsers() > 0) {
                        channel.removeUsers(await channel.getUsers());
                    }
                    let result = await channel.destroy();
                    if (result) {
                        return true;
                    } else {
                        throw new ApiException("Error deleting the channel");
                    }
                } else {
                    throw new NotFound("Channel Not Found");
                }
            });
        } else {
            throw new NotFound("Channel Not Found");
        }
    },
    getParticipants: async (id) => {
        if (id > 0) {
            return await Channel.findByPk(id, {
                include: [{
                    model: User, attributes:
                        ['id', 'firstname', 'username', 'lastname', 'email', 'organization', 'avatar', 'status'],
                    as: 'users'
                }]
            }).then(async (channel) => {
                if (channel) {
                    return channel.users;
                } else {
                    throw new NotFound("Channel Not Found");
                }
            });
        } else {
            throw new NotFound("Channel Not Found");
        }
    },
    getMessages: async (id, data) => {
        if (id > 0) {
            data['where'] = ['channel_id', id];
            data['order_by'] = { created_at: 'desc' };
            data['fields'] = ['id', 'content', 'status'];
            var options = await queries.standardize_search(data);
            const messages = await queries.findAll(Message, options);

            return messages;
            /* return await Channel.findByPk(id, {
                include: [{
                    model: Message, attributes:
                        ['id', 'content', 'status'],
                    as: 'messages'
                }]
            }).then(async (channel) => {
                if (channel) {
                    return channel.messages;
                } else {
                    throw new NotFound("Channel Not Found");
                }
            }); */
        } else {
            throw new NotFound("Channel Not Found");
        }
    }
}
