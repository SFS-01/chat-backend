const controller = require('../controllers/FileController');

module.exports = (router) => {
    router.route('/files').post(controller.store);
    router.route('/files/search').post(controller.list);
    router.route('/files/:id').get(controller.getFile);
    router.route('/files/:id/json').get(controller.show);
    router.route('/files/:id/delete').delete(controller.delete);
};