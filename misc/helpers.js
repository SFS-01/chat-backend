const validation = require('../lang/en/validation')
const validator = require('indicative/validator');
const multiparty = require('multiparty');
const { BadRequest } = require('./exceptions');

module.exports = {
    toJson(json, res = {}) {
        if (this.isJson(json)) {
            return json;
        } else if (typeof json == 'string') {
            try {
                return JSON.parse(json);
            } catch (e) { }
        }
        return res;
    },
    async isJson(json) {
        if (typeof json == 'string') {
            try {
                JSON.parse(json);
            } catch (e) {
                return false;
            }
            return true;
        } else {
            return typeof json == 'object' && json != null;
        }
    },
    inArray(needle, haystack) {
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                return true;
            }
        }
        return false;
    },
    isPath(needle, haystack) {
        needle = (needle + '').trim().toLowerCase();
        for (var i = 0; i < haystack.length; i++) {
            let patt = new RegExp(haystack[i].trim().toLowerCase(), "g");
            if (patt.test(needle)) {
                return true;
            }
        }
        return false;
    },
    isAssoc(arr) {
        if (typeof arr == 'array' || typeof arr == 'object') {
            for (var i = 0; i < Object.keys(arr).length; i++) {
                if (typeof arr[i] == 'undefined') {
                    return 1;
                }
            }
        }
        return 0;
    },
    capitalize(string) {
        if (string && string != '') {
            return string.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        } else {
            return string;
        }
    },
    guidGenerator() {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + S4() + S4() + S4() + Date.now());
    },
    unknownError(error) {
        return {
            'status': 0,
            'errors': [
                'Connection Error!'
            ],
            'data': error
        };
    },
    generateRandomString(length = 8) {
        var characters = 'A0B1C2D3E4F5G6H78I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';
        var str = '';
        var characters_length = characters.length - 1;
        for (var i = 0; i < length; i++) {
            str += characters[this.getRandomInt(0, characters_length)];
        }
        return str;
    },
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getValue(obj, key, _default) {
        _default = (typeof _default == 'undefined') ? '' : _default;
        // console.log(obj, key)
        return key.split(".").reduce(function (o, x) {
            return (typeof o[x] == "undefined" || o[x] === null || o[x] == null) ? _default : o[x];
        }, obj);
    },
    has(obj, key) {
        return key.split(".").every(function (x) {
            if (typeof obj != "object" || obj === null || !x in obj)
                return false;
            obj = obj[x];
            return true;
        });
    },
    async validationFail(data, rules, messages) {
        var _this = this;
        messages = Object.assign(validation, messages)
        return validator.validate(data, rules, messages)
            .then(function () {
                return false;
            })
            .catch(function (error) {
                return Promise.reject(error)
            });
    },
    convertPipeToArray: async (pipeString) => {
        pipeString = pipeString.trim();

        if (pipeString.length <= 2) {
            return pipeString;
        } else {
            var quoteCharacter = pipeString.substring(0, 1)
            var endCharacter = pipeString.substring(-1, 1)

            if (quoteCharacter !== endCharacter) {
                return pipeString.split("|");
            } else if (quoteCharacter != "'" && quoteCharacter != '"') {
                return pipeString.split("|");
            } else {
                return pipeString.split("|", pipeString.replaceAll(quoteCharacter));
            }
        }
    },
    async splitFullname(name) {
        var fullname = [];
        var name_exploded = name.split(" ");
        if (name_exploded.length > 2) {
            fullname['first_name'] = name_exploded[0] + ' ' + name_exploded[1];
            fullname['last_name'] = name_exploded[2];
        } else {
            fullname['first_name'] = (name_exploded[0]) ? name_exploded[0] : '';
            fullname['last_name'] = (name_exploded[1]) ? name_exploded[1] : '';
        }

        return fullname;
    },
    gen_invoice_token: async (id) => {
        var k = Math.floor(10000000 + id);
        return k;
    },
    async intersectKeys(a1, a2) {
        var res = {};
        for (var i in a1) {
            if (a2[i]) {
                res[i] = a1[i]
            }
        }
        return res;
    },
    async randomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    async arrayFlip(trans) {
        var key, tmp_ar = {};
        for (key in trans) {
            if (trans.hasOwnProperty(key)) {
                tmp_ar[trans[key]] = key;
            }
        }

        return tmp_ar;
    },
    async cleanFilename(info) {
        info = info.trim();
        // info = info.replace(/^[\pZ\pC]+|[\pZ\pC]+/u, ' ');
        var not_permits = ["á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú", "ñ", "À", "Ã", "Ì", "Ò", "Ù", "Ã™", "Ã ", "Ã¨", "Ã¬", "Ã²", "Ã¹", "ç", "Ç", "Ã¢", "ê", "Ã®", "Ã´", "Ã»", "Ã‚", "ÃŠ", "ÃŽ", "Ã”", "Ã›", "ü", "Ã¶", "Ã–", "Ã¯", "Ã¤", "«", "Ò", "Ã", "Ã„", "Ã‹"];
        var permits = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U", "n", "N", "A", "E", "I", "O", "U", "a", "e", "i", "o", "u", "c", "C", "a", "e", "i", "o", "u", "A", "E", "I", "O", "U", "u", "o", "O", "i", "a", "e", "U", "I", "A", "E"];
        info = info.replace(not_permits, permits);
        info = info.toLowerCase();
        info = info.replace(/[\s+]/g, '_');
        return info;
    },
    async multipart(req, callback) {
        var formData = new multiparty.Form();

        var data = {}
        formData.parse(req, (error, fields, files) => { //The callback function returns error if any, fields(properties), and files loaded
            if (error) {
                throw new BadRequest(error.message)
            }
            for (const key in fields) {
                data[key] = fields[key][0]
            }
            for (const key in files) {
                for (const i in files[key]) {
                    if (typeof data[key] == 'undefined') {
                        data[key] = []
                    }
                    data[key].push(files[key][i]);
                }
            }
            callback(data)
        });
    }
}