const basicAuth = require('basic-auth');
const api = require('../misc/api');

module.exports = {
    auth: async (req, res, next) => {
        var user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.status(401).send(api.error('401', "Authentication error. Invalid credentials"))
        }
        if (user.name === process.env.EXTERNAL_USERNAME && user.pass === process.env.EXTERNAL_PASSWORD) {
            next();
        } else {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.status(401).send(api.error('401', "Authentication error. Invalid credentials"))
        }
    }
};