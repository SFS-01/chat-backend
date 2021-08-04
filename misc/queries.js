const { Sequelize } = require("../models");
const helpers = require("./helpers");
const Op = Sequelize.Op

module.exports = {
    standardize_search: async (data) => {
        var options = [];
        for (var key in data) {
            var value = data[key];
            if (!helpers.inArray(key, ['limit', 'query', 'page', 'take'])) {
                if (typeof value == 'string') {
                    if (helpers.isJson(value)) {
                        value = JSON.parse(value);
                    }
                } else if (!Array.isArray(value) && typeof value != 'object') {
                    value = []
                }
            }

            switch (key) {
                case 'query':
                    if (typeof value === 'string') {
                        if (JSON.parse(value)) {
                            value = JSON.parse(value);
                            if (typeof value === 'object' && helpers.isAssoc(value)) {
                                options['q'] = helpers.getValue(value, 'value', '');
                                options['q_fields'] = helpers.getValue(value, 'fields', '');
                            }
                        } else {
                            options['q'] = value;
                        }
                    } else if (typeof value === 'object' && helpers.isAssoc(value)) {
                        options['q'] = helpers.getValue(value, 'value', '');
                        options['q_fields'] = helpers.getValue(value, 'fields', '');
                    }
                    break;
                case 'where':
                case 'or_where':
                case 'where_null':
                case 'where_not_null':
                case 'where_in':
                case 'where_not_in':
                    if (value.length > 0) {
                        options[key] = value;
                    }
                    break;
                case 'fields':
                    if (value.length > 0) {
                        options['fields'] = value;
                    }
                    break;
                case 'with':
                    if (value.length > 0) {
                        options['with'] = value;
                    }
                    break;
                case 'limit':
                    if (value > 0) {
                        options[key] = value;
                    } else {
                        options[key] = 15;
                    }
                    break;
                case 'order_by':
                    if (Object.keys(value).length > 0) {
                        options[key] = value;
                    }
                    break;
                case 'group_by':
                case 'page':
                case 'take':
                    options[key] = value;
                    break;
            }
        }
        return options;
    },
    findAll: async (model, options) => {
        const query = await module.exports.buildingModel(options);
        let results = {};
        if (typeof options['limit'] != 'undefined') {
            results = await model.findAndCountAll(query);
            return {
                pagination: {
                    total: results.count,
                    per_page: query.limit,
                    current_page: (options.page) ? options.page : 1,
                    total_pages: parseInt(Math.ceil(results.count / query.limit))
                },
                data: results.rows
            };
        } else {
            results = await model.findAll(query);
            return {
                pagination: [],
                data: results
            };
        }
    },
    buildingModel: async (options) => {
        var query = {
            limit: helpers.getValue(options, 'take', 15),
            offset: 0
        }
        var and = []
        if (options['q'] && typeof options['q'] === 'string' && options['q'] != '') {
            var fields = []
            if (options['q_fields'] && options['q_fields'].length > 0) {
                fields = options['q_fields'];
            }

            if (fields.length > 0) {
                var q = await module.exports.normalize_query(options['q']);
                var _fields = '';
                var count = (fields.length < 3) ? 3 : fields.length;

                for (var i = 0; i < count; i++) {
                    _fields += (fields[i]) ? (fields[i] + ', ') : 'null, '
                }

                _fields = _fields.replace(/,\s$/g, '').trimEnd();

                q = q.replace('?field?', "CONCAT_WS('|'," + _fields + ")");
                and.push(Sequelize.literal(q))
            }
        }

        if (options['fields'] && options['fields'].length > 0) {
            if (options['fields'].length > 1) {
                query.attributes = options['fields'];
            } else {
                if (options['fields'][0] != '*') {
                    query.attributes = options['fields'];
                }
            }
        }

        if (options['where'] && options['where'].length > 0) {
            if (!query['where']) {
                query['where'] = {}
            }
            if (!Array.isArray(options['where'][0])) {
                if (options['where'].length > 2) {
                    query.where[options['where'][0]] = {
                        [Op[options['where'][1]]]: options['where'][2]
                    }
                } else {
                    query.where[options['where'][0]] = options['where'][1];
                }
            } else {
                for (var i in options['where']) {
                    if (Array.isArray(options['where'][i])) {
                        if (options['where'][i].length > 2) {
                            query.where[options['where'][i][0]] = {
                                [Op[options['where'][i][1]]]: options['where'][i][2]
                            }
                        } else {
                            query.where[options['where'][i][0]] = options['where'][i][1];
                        }
                    }
                }
            }
        }

        if (options['or_where'] && options['or_where'].length > 0) {
            if (!query['where']) {
                query['where'] = {}
            }
            var obj = {};
            query.where[Op.or] = [];
            if (!Array.isArray(options['or_where'][0])) {
                if (options['or_where'].length > 2) {
                    obj[options['or_where'][0]] = {
                        [Op[options['or_where'][1]]]: options['or_where'][2]
                    }
                } else {
                    obj[options['or_where'][0]] = options['or_where'][1];
                }

                query.where[Op.or].push(obj);
            } else {
                for (var i in options['or_where']) {
                    if (Array.isArray(options['or_where'][i])) {
                        if (options['or_where'][i].length > 2) {
                            obj[options['or_where'][i][0]] = {
                                [Op[options['or_where'][i][1]]]: options['or_where'][i][2]
                            }
                        } else {
                            obj[options['or_where'][i][0]] = options['or_where'][i][1];
                        }
                        query.where[Op.or].push(obj);
                    }
                }
            }
        }

        if (options['where_in'] && options['where_in'].length > 0) {
            if (!query['where']) {
                query['where'] = {}
            }
            for (var i in options['where_in']) {
                query.where[options['where_in'][i]['field']] = {
                    [Op.in]: options['where_in'][i]['value']
                }
            }
        }

        if (options['where_not_in'] && options['where_not_in'].length > 0) {
            if (!query['where']) {
                query['where'] = {}
            }
            for (var i in options['where_not_in']) {
                query.where[options['where_not_in'][i]['field']] = {
                    [Op.in]: options['where_not_in'][i]['value']
                }
            }
        }

        if (options['where_null'] && options['where_null'].length > 0) {
            if (!query['where']) {
                query['where'] = {}
            }
            for (var i in options['where_null']) {
                query.where[options['where_null'][i]] = {
                    [Op.is]: null
                }
            }
        }

        if (options['where_not_null'] && options['where_not_null'].length > 0) {
            if (!query['where']) {
                query['where'] = {}
            }
            for (var i in options['where_not_null']) {
                query.where[options['where_not_null'][i]] = {
                    [Op.not]: null
                }
            }
        }

        if (options['with'] && options['with'].length > 0) {
            if (Array.isArray(options['with'])) {
                query['include'] = options['with']
            }
        }

        if (options['order_by'] && Object.keys(options['order_by']).length > 0) {
            query['order'] = []
            for (var field in options['order_by']) {
                query['order'].push([field, options['order_by'][field]])
            }
        }
        if (options['limit']) {
            query.limit = options['limit'] * 1
        }
        if (options['page']) {
            query.offset = (options['page'] * 1 - 1) * query.limit
        }

        if (and.length > 0) {
            if (!query['where']) {
                query['where'] = {};
            }
            query['where'][Op.and] = and;
        }

        return query;
    },
    normalize_query: async (query) => {
        var where = '';
        if (typeof query === 'string' && query != '') {
            whereAND = '';
            whereOR = '';
            var aQuery = query.split(' ');
            var value;
            for (var i in aQuery) {
                value = aQuery[i];
                if (value.startsWith('+*') || (value.startsWith('+') && value.endsWith('*'))) {
                    whereAND += " ?field? LIKE '" + value.replace(/^\+\*|\*+$/g, "%") + "' AND";
                } else if (value.startsWith('+')) {
                    whereAND += " ?field? LIKE '".value.replace(/^\+/g, "") + "' AND";
                } else if (value.startsWith('*') || value.endsWith('*')) {
                    whereOR += " ?field? LIKE '".value.replace(/^\*|\*$/g, "%") + "' OR";
                } else {
                    whereOR += " ?field? LIKE '" + value + "' OR";
                }
            }
            if (whereOR != '') {
                where += '(' + whereOR.replace(/[OR]+$/g, '') + ') OR';
            }
            if (whereAND != '') {
                where += ' (' + whereAND.replace(/[AND]+$/g, '') + ') OR';
            }
            where = where.replace(/[OR]+$/g, '');
        }

        return where;
    }
}