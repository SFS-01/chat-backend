const axios = require('axios');

module.exports = {
    success: (message, data, pagination) => {
        let response = {
            'status': 1,
            'message': message,
        };
        if ((Array.isArray(data) || typeof data == 'object')) {
            response['data'] = data;
        }
        if (typeof pagination != 'undefined') {
            response['pagination'] = pagination;
        }
        return response;
    },
    error: (code, errors, data) => {
        let response = {
            'status': 0,
            'code': code,
        };
        if (typeof errors == 'string') {
            response['errors'] = [errors];
        } else {
            response['errors'] = errors;
        }
        if ((Array.isArray(data) || typeof data == 'object') && data.length > 0) {
            response['data'] = data;
        }
        return response;
    },
    call: async (url, data, method, headers, options) => {
        var opts = {}
        
        if(options && typeof options === 'object'){
            opts = options;
        }

        opts.method = (method) ? method.toLowerCase() : 'post';
        
        if(headers && typeof headers === 'object'){
            opts.headers = headers
        }

        opts.url = url;

        if(data != null){
            switch(opts.method){
                case "post":
                case "put":
                    if(opts.headers && opts.headers['Content-Type']){
                        if(opts.headers['Content-Type'] == 'application/x-www-form-urlencoded'){
                            var params = new URLSearchParams();
                            for(var i in data){
                                params.append(i, data[i]);
                            }
                            data = params;
                        }else if(opts.headers['Content-Type'] == 'application/form-data'){
                            var params = new FormData();
                            for(var i in data){
                                params.append(i, data[i]);
                            }
                            data = params;
                        }
                    }
                    opts.data = data
                    break;
                case "get":
                    opts.params = data
                    break;
            }
        }
        
        try{
            if(data == null){
                (opts['data']) ? delete opts['data'] : null
                (opts['params']) ? delete opts['params'] : null
            }
            
            var response = await axios(opts);
            if(await helpers.isJson(response)){
                return {
                    status: 1,
                    data: response.data
                }
            }else{
                return {
                    status: 0,
                    errors: response
                }
            }
        }catch(error){
            console.log(error)
            return {
                status: 0,
                errors: (error.response) ? error.response : error
            }
        }
    }
}