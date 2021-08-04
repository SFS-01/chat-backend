const controller = require('../controllers/authController');
const apiMiddleware = require('../middleware/apiMiddleware');

module.exports = (router) => {
    router.route('/login').post(apiMiddleware.ipAddress, controller.login);
    //router.route('/forgot-password').post(apiMiddleware.ipAddress,controller.forgotPassword);
};