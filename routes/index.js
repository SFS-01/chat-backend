const auth = require('./auth');
const users = require('./users');
const message = require('./message');
const channel = require('./channel');

module.exports = (router) => {
    users(router);
    auth(router);
    message(router);
    channel(router);

    return router;
};