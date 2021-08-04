const controller = require('../controllers/channelController');
const basicAuth = require('../middleware/basciAuthApiMiddleware');
const apiMiddleware = require('../middleware/apiMiddleware');

module.exports = (router) => {
    //External interface
    router.route('/channels/search').post(basicAuth.auth, controller.search);
    router.route('/channels').post(basicAuth.auth, controller.store);
    router.route('/channels/:id').get(basicAuth.auth, controller.show);
    router.route('/channels/:id').put(basicAuth.auth, controller.update);
    router.route('/channels/delete/:id').delete(basicAuth.auth, controller.remove);
    router.route('/channels/add-users/:id').put(basicAuth.auth, controller.addUsers);
    router.route('/channels/remove-users/:id').put(basicAuth.auth, controller.removeUsers);

    //Internal interface
    router.route('/internal/channels/search').post(apiMiddleware.validateToken, controller.search);
    router.route('/internal/channels').post(apiMiddleware.validateToken, controller.storeInternal);
    router.route('/internal/channels/:id').put(apiMiddleware.validateToken, controller.updateInternal);
    router.route('/internal/channels/:id').get(apiMiddleware.validateToken, controller.showInternal);
    router.route('/internal/channels/delete/:id').delete(apiMiddleware.validateToken, controller.deleteInternal);
    router.route('/internal/channels/:id/participants').get(apiMiddleware.validateToken, controller.getParticipants);
    router.route('/internal/channels/:id/messages').get(apiMiddleware.validateToken, controller.getMessages);
};