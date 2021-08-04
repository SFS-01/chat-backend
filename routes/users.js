const controller = require('../controllers/usersController');
const basicAuth = require('../middleware/basciAuthApiMiddleware');
const apiMiddleware = require('../middleware/apiMiddleware');

module.exports = (router) => {
    //External interface
    router.route('/users/search').post(basicAuth.auth, controller.search);
    router.route('/users').post(basicAuth.auth, controller.store);
    router.route('/users/:id').get(basicAuth.auth, controller.show);
    router.route('/users/:id').put(basicAuth.auth, controller.update);
    router.route('/users/delete/:id').delete(basicAuth.auth, controller.remove);

    //Internal interface
    router.route('/internal/users/search').post(apiMiddleware.validateToken, controller.search);
    //router.route('/users/profile').get(apiMiddleware.validateToken, controller.getProfile);
    //router.route('/users/profile').put(apiMiddleware.validateToken, controller.updateProfile);
    //router.route('/users/update-avatar').post(apiMiddleware.validateToken, controller.updateAvatar);
};