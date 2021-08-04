const { User, PaymentProfile, Sequelize, Transaction, Order } = require("../models");
const Op = Sequelize.Op
const bcrypt = require('bcrypt');
const { BadRequest, ApiException, NotFound } = require("../misc/exceptions");
const config = require('../config/config');
const sUserActivityLog = require("./userActivityLogService")
const cache = require('memory-cache');
const queries = require("../misc/queries");
let memCache = new cache.Cache();


module.exports = {
    //External Interface
    search: async (data) => {
        var options = await queries.standardize_search(data);
        const results = await queries.findWithPagination(User, options);
        return results;
    },
    show: async (id) => {
        if (id > 0) {
            return await User.findOne({ where: { external_id: id } })
                .then(async (user) => {
                    if (user) {
                        return user;
                    } else {
                        throw new NotFound("User Not Found");
                    }
                });

        } else {
            throw new NotFound("User Not Found");
        }
    },
    store: async (data) => {
        const rules = {
            id: 'required|integer',
            firstname: 'required|string',
            email: 'required|email',
            password: 'required|min:8',
        }

        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err)
        })

        var _user = await User.findOne({ where: { external_id: data.id } });

        if (_user) {
            throw new ApiException("User is already registered");
        }

        const hash = await module.exports.hashPass(data.password).catch(err => {
            throw new ApiException(err)
        })

        data.password = hash;
        data.status = 'active';
        data.external_id = data.id;
        data.username = data.firstname + '_' + data.id;

        const user = await User.create(data, {
            fields: [
                'external_id',
                'firstname',
                'lastname',
                'username',
                'email',
                'phone',
                'password',
                'alternative_email',
                'organization',
                'status',
                'avatar',
                'email_verified_at',
                'last_session'
            ]
        })
        return user;
    },
    update: async (id, data) => {
        const rules = {
            firstname: 'required|string',
            email: 'required|email'
        }
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err);
        });

        return await User.findOne({ where: { external_id: id } })
            .then(async (user) => {
                if (user) {
                    await user.update(data);
                    await user.reload();

                    return user;
                } else {
                    throw new NotFound("User Not Found");
                }
            });
    },
    delete: async (id) => {
        if (id > 0) {
            return await User.findOne({ where: { external_id: id } })
                .then(async (user) => {
                    if (user) {
                        let result = await user.destroy();
                        if (result) {
                            return true;
                        } else {
                            throw new ApiException("Error deleting the user");
                        }
                    } else {
                        throw new NotFound("User Not Found");
                    }
                });

        } else {
            throw new NotFound("User Not Found");
        }
    },
    getProfile: async (data) => {
        const rules = {
            id: 'required',
        }

        //Validate fields
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err)
        })

        //Get User Profile
        const user = await User.findOne({ where: { id: data.id } });

        if (!user) {
            throw new NotFound("User not found")
        }

        return {
            id: user.id,
            avatar: user.avatar,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            phone: user.phone,
            avatar: user.avatar,
            pending_balance: user.pending_balance,
            available_balance: user.available_balance,
        }
    },
    getDetails: async (id) => {
        if (id && id > 0) {
            const user = await User.findOne({ where: { id: id }, include: ['roles', 'permissions'] });

            if (!user) {
                throw new NotFound("User not found")
            }

            var roles = [];
            if (user.roles) {
                for (var i in user.roles) {
                    roles.push(user.roles[i].name)
                }
            }

            var permissions = [];
            if (user.permissions) {
                for (var i in user.permissions) {
                    permissions.push(user.permissions[i].name)
                }
            }

            return {
                id: user.id,
                avatar: user.avatar,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                avatar: user.avatar,
                pending_balance: user.pending_balance,
                available_balance: user.available_balance,
                roles: roles,
                permissions: permissions
                //TODO Permissions
            }
        } else {
            return [];
        }
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
    setCache: async (value, user_id, time) => {
        var key = 'user_details_' + user_id;

        if (typeof value === 'string' || value instanceof String) {
            var _value = JSON.stringify(value);
            console.log('here')
            if (_value) {
                value = _value;
            }
        } else {
            value = JSON.stringify(value);
        }

        memCache.put(key, value, time)
    },
    getCache: async (user_id) => {
        var key = 'user_details_' + user_id;

        let cacheContent = memCache.get(key);

        var user = [];

        if (cacheContent) {
            var user = JSON.parse(cacheContent);
        } else {
            var user = await module.exports.getDetails({ id: user_id })
            if (user) {
                await module.exports.setCache(user, user_id);
            }
        }

        return user;
    },
    removeCache: (user_id) => {
        var key = key + '_' + user_id;
        memCache.del(key);
    },
    refreshUserCache: async (user_id) => {
        module.exports.setCache(await module.exports.getDetails(user_id), user_id)
    },
}
