var api = require('./api')

class ApiException extends Error {
    constructor(message, code, data) {
        super();
        this.message = message;
        this.code = code;
        this.data = data;

    }

    getCode() {
        if (this instanceof BadRequest) {
            return 400;
        } else if (this instanceof NotFound) {
            return 404;
        } else if (this instanceof Forbidden) {
            return 403;
        } else if (this instanceof Unathenticated) {
            return 401;
        }
        return 500;
    }

    apiResponse() {
        return api.error(this.code, this.message, this.data);
    }

}

class BadRequest extends ApiException { }
class NotFound extends ApiException { }
class Forbidden extends ApiException { }
class Unathenticated extends ApiException { }

module.exports = {
    ApiException,
    BadRequest,
    Forbidden,
    NotFound,
    Unathenticated
};