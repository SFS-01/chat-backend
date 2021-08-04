const jwt = require('jsonwebtoken');
const api = require('../misc/api');
const { Unathenticated, Forbidden } = require('../misc/exceptions');
const requestIp = require('@supercharge/request-ip');
const usersService = require('../services/usersService');
const permissionService = require('../services/permissionService');
const roleService = require('../services/roleService');

module.exports = {
    ipAddress: (req, res, next) => {
        req.auth = {
            ip: requestIp.getClientIp(req)
        }
        next()
    },
    validateToken: async (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let result;
        if (authorizationHeader) {
            const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
            const options = {
                expiresIn: '2d',
            };
            try {
                // verify makes sure that the token hasn't expired and has been issued by us
                result = jwt.verify(token, process.env.APP_KEY, options);

                // Let's pass back the decoded token to the request object
                req.auth = result;

                req.auth.ip = requestIp.getClientIp(req)

                // res.auth = req.auth
                // We call next to pass execution to the subsequent middleware
                next();
            } catch (err) {
                // Throw an error just in case anything goes wrong with verification
                // console.log(err)
                throw new Error(err);
            }
        } else {
            res.status(401).send(api.error('401', "Authentication error. Token required"))
        }
    },
    permissions: (permissions) => {
        return async (req, res, next) => {
            if (!req.auth) {
                console.log('here')
                throw new Unathenticated("User is not logged in")
            }

            const has_permission = await permissionService.hasAnyPermission(permissions, req.auth.user.id)

            if (has_permission) {
                next();
            } else {
                res.status(403).send(api.error('403', "You don't have permission to access this route"))
            }
        }
    },
    roles: (roles) => {
        return async (req, res, next) => {
            if (!req.auth) {
                res.send(api.error('403', "You don't have permission to access this route"))
                // throw new Unathenticated("User is not logged in")
            }

            const has_role = await roleService.hasAnyRole(roles, req.auth.user.id)

            if (has_role) {
                next();
            } else {
                res.status(403).send(api.error('403', "You don't have permission to access this route"))
            }
        }

    }
};