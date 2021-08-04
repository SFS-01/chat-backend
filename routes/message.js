const controller = require('../controllers/messageController');
const apiMiddleware = require('../middleware/apiMiddleware');

module.exports = (router) => {
    router.route('/messages/search').post(apiMiddleware.validateToken, controller.search);
    router.route('/messages').post(apiMiddleware.validateToken, controller.store);
    router.route('/messages/:id').put(apiMiddleware.validateToken, controller.update);
    router.route('/messages/:id').get(apiMiddleware.validateToken, controller.show);
    router.route('/messages/delete/:id').delete(apiMiddleware.validateToken, controller.delete);
};