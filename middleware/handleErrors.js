const api = require("../misc/api");
const { ApiException } = require("../misc/exceptions");
const log4js = require("log4js");

const handleErrors = (err, req, res, next) => {

    log4js.configure({
        appenders: { server: { type: "file", filename: "./logs/server.log" } },
        categories: { default: { appenders: ["server"], level: "error" } }
    });

    const logger = log4js.getLogger("server");
    

    if (err instanceof ApiException) {
        if(err.getCode() == 500){
            logger.error(err)
        }
        return res.status(err.getCode()).json(err.apiResponse());
    }

    logger.error(err)
    return res.status(500).json(api.error(500, err.message));
}
  
module.exports = handleErrors;