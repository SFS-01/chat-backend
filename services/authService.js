const { User, PersonalAccessToken, UserRole, Plan, Subscription } = require("../models");
const { BadRequest, NotFound } = require("../misc/exceptions");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sUser = require("./usersService");
const sRole = require("./roleService");
const permissionService = require("./permissionService");
var crypto = require('crypto');

module.exports = {
    login: async (data) => {
        const rules = {
            email: 'required|email',
            password: 'required',
        }

        //Validate fields
        var fail = await helpers.validationFail(data, rules).catch(err => {
            throw new BadRequest(err)
        })

        const user = await User.findOne({ where: { email: data.email }, include: ['roles', 'permissions'] });

        if (!user) {
            throw new NotFound("User not found")
        }

        const validPassword = await module.exports.validatePass(data.password, user).catch(err => {
            throw new BadRequest(err)
        });

        var response = await module.exports.createToken(user, data)

        await sUser.refreshUserCache(user.id);
        return response;

    },
    createToken: async (user, data) => {

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
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
            }
        };
        const options = { expiresIn: process.env.TOKEN_LIFETIME };
        const secret = process.env.APP_KEY;

        const token = jwt.sign(payload, secret, options);

        await PersonalAccessToken.create({
            user_id: user.id,
            token: token,
            expires_in: moment().add('2 days').format("YYYY-MM-DD HH:mm:ss"),
            last_used_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            info: {
                ip_address: data.creator.ip
            }
        })

        /*  var cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENCRYPT_KEY, process.env.ENCRYPT_IV);
         cipher.update(user.id.toString(), 'binary', 'base64');
         var crypt_id = cipher.final('base64') */

        return {
            user: {
                id: user.id,
                external_id: user.external_id,
                avatar: user.avatar,
                email: user.email,
                alternative_email: user.alternative_email,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                organization: user.organization,
                phone: user.phone,
                roles: roles,
                permissions: permissions,
            },
            auth: {
                access_token: token
            },
        }
    },
    signup: async (data) => {
        const user = await sUser.store(data);

        if (data['current_plan_id']) {
            const plan = await Plan.findByPk(data['current_plan_id']);

            if (!plan) {
                await user.destroy();
                throw new NotFound("Subscription cannot be created with an invalid plan");
            }
            var total_amount = plan.min_price;

            var subs = {
                owner_id: user.id,
                owner_type: 'user',
                current_plan_id: plan.id,
                interval_count: plan.interval_count,
                interval: plan.interval,
                price: plan.min_price,
                free_bulk_skips: plan.free_bulk_skips,
                free_single_skips: plan.free_single_skips,
                price_bulk_skip: plan.price_bulk_skip,
                price_single_skip: plan.price_single_skip,
                price_sub_user: plan.price_sub_user,
                days_to_pay: 0,
                grace_days: 0,
                data: JSON.stringify(plan),
                status: 'pending'
            }

            var _subs = await Subscription.create(subs)

            data['order_items'] = [{
                name: plan.title,
                owner_type: 'subscription',
                owner_id: _subs.id,
                description: plan.description,
                qty: 1,
                price: plan.min_price,
            }];

            if (data['addons'] && plan.addons) {
                if (typeof data['addons'] === 'string') {
                    data['addons'] = JSON.parse(data['addons']);
                }
                console.log('hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
                var _addons = {};
                for (var i in data['addons']) {
                    if (plan.addons[data['addons'][i]]) {
                        total_amount = total_amount * 1 + plan.addons[data['addons'][i]].min_price;
                        data['order_items'].push({
                            name: data['addons'][i],
                            owner_type: 'subscription',
                            owner_id: _subs.id,
                            description: plan.addons[data['addons'][i]].description,
                            qty: 1,
                            price: plan.addons[data['addons'][i]].min_price,
                        })

                        _addons[data['addons'][i]] = plan.addons[data['addons'][i]];
                    }
                }
                _subs.addons = JSON.stringify(_addons);
            }

            _subs.total_price = total_amount;
            console.log('hereeeeeeeeeeeeeeeeeeeeeee');
            console.log(total_amount);
            _subs.save()
        }

        const roles = await sRole.assignRole(user.id, 'customer');
        const permissions = await permissionService.assignPermission(user.id, 'access_leadx');

        if (data.autologin && data.autologin > 0) {
            const payload = {
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                }
            };
            const options = { expiresIn: process.env.TOKEN_LIFETIME };
            const secret = process.env.APP_KEY;

            const token = jwt.sign(payload, secret, options);

            await PersonalAccessToken.create({
                user_id: user.id,
                token: token,
                expires_in: moment().add('2 days').format("YYYY-MM-DD HH:mm:ss"),
                last_used_at: moment().format("YYYY-MM-DD HH:mm:ss")
            })

            return {
                user: {
                    id: user.id,
                    avatar: user.avatar,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    phone: user.phone,
                    roles: roles,
                    permissions: permissions
                },
                auth: {
                    access_token: token
                }
            }
        } else {
            return user;
        }
    },
    validatePass: async (password, user) => {
        //Validating password
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            return Promise.resolve(true)
        } else {
            return Promise.reject("Invalid Password");
        }

    }

}
