const { NotFound } = require("../misc/exceptions");
const { Permission, UserPermission } = require("../models");
const sUser = require('./usersService')
// const bcrypt = require('bcrypt');
// const { BadRequest, ApiException } = require("../misc/exceptions");
// const config = require('../config/config');


module.exports = {
    getPermissionsFromSQLByUserID: async (id) => {
        var permissions = [];
        var sql = "SELECT `user_permission`.`permission_id`, `user_permission`.`restrictable_type`, GROUP_CONCAT(`user_permission`.`restrictable_id`) AS 'restrictables', ANY_VALUE(`permissions`.`name`) AS 'name' FROM `user_permission`"
            sql += " LEFT JOIN `permissions` on `user_permission`.`permission_id` = `permissions`.`id`"
            sql += " WHERE `user_id` = ? AND `user_permission`.`removed_at`  IS NULL"
            sql += " GROUP By `permission_id`, `user_permission`.`restrictable_type`";

        var _permissions =  await sequelize.query(sql, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            }
        );

        for(var i in _permissions){
            if(!permissions[_permissions[i]['name']]){
                permissions[_permissions[i]['name']] = []
            }
            if(_permissions[i]['restrictable_type']){
                permissions[_permissions[i]['name']][_permissions[i]['restrictable_type']] = helpers.getValue(_permissions[i], 'restrictables', '').split(',')
            }
        }

        $sql =  "SELECT `user_role`.`role_id`, `user_role`.`restrictable_type`, `user_role`.`restrictable_id`, ANY_VALUE(`roles`.`name`) AS 'role_name',"
        sql += " `permissions`.`id` as 'permission_id', `permissions`.`name` as 'permission_name' FROM `user_role`"
        sql += " LEFT JOIN `roles` on `user_role`.`role_id` = `roles`.`id`"
        sql += " LEFT JOIN `role_permission` on `user_role`.`role_id` = `role_permission`.`role_id`"
        sql += " LEFT JOIN `permissions` on `role_permission`.`permission_id` = `permissions`.`id`"
        sql += " WHERE `user_role`.`user_id` = ? AND `user_role`.`removed_at` IS NULL AND `permissions`.`name` IS NOT NULL"
        sql += " GROUP BY `user_role`.`role_id`, `user_role`.`restrictable_type`, `user_role`.`restrictable_id`, `permissions`.`id`";

        var _role_permissions =  await sequelize.query(sql, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            }
        );

        for(var i in _role_permissions){
            if(!permissions[_role_permissions[i].permission_name]){
                permissions[_role_permissions[i].permission_name] = []
            }
            if(_role_permissions[i].restrictable_type){
                if(!permissions[_role_permissions[i].permission_name][_role_permissions[i].restrictable_type]){
                    permissions[_role_permissions[i].permission_name][_role_permissions[i].restrictable_type] = [_role_permissions[i].restrictable_id + ''];
                }else {
                    if(!permissions[_role_permissions[i].permission_name][_role_permissions[i].restrictable_type].includes(_role_permissions[i].restrictable_id)){
                        permissions[_role_permissions[i].permission_name][_role_permissions[i].restrictable_type].push(_role_permissions[i].restrictable_id + '')
                    }
                }

            }
        }
        return permissions;
    },
    assignPermission: async (user_id, permission, options) => {
        var date = moment().format('YYYY-MM-DD HH:mm:ss');

        //TODO
        /************* Implement restrictable functionality *************/

        var where = {
            user_id: user_id,
            removed_at: null
        }

        if(typeof permission === 'string'){
            var _permission = await Permission.findOne({where: {name : permission}});
            if(!_permission){
                throw new NotFound("Permission not found")
            }
            where['permission_id'] = _permission.id;
        }else if(Number.isInteger(permission)){
            where['permission_id'] = _permission.id;
        } else if(!permission instanceof Permission){
            where['permission_id'] = _permission.id;
        }else{
            throw new NotFound("Permission not found")
        }

        var a_permission = await UserPermission.findOne({ where: where});

        if(a_permission){
            a_permission.assigned_at = date;
            a_permission.save();
        }else{
            where['assigned_at'] = date;
            a_permission = await UserPermission.create(where)
        }

        sUser.refreshUserCache(user_id);

        return a_permission;
    },
    removePermission: async (user_id, permission, options) => {
        var date = moment().format('YYYY-MM-DD HH:mm:ss');

        //TODO
        /************* Implement restrictable functionality *************/

        var where = {
            user_id: user_id,
            removed_at: null
        }

        if(typeof permission === 'string' || permission instanceof String){
            var _permission = Permission.findOne({where: {name : permission}});
            if(!_permission){
                throw new NotFound("Permission not found")
            }
            where['permission_id'] = _permission.id;
        }else if(Number.isInteger(permission)){
            where['permission_id'] = _permission.id;
        } else if(!permission instanceof Permission){
            where['permission_id'] = _permission.id;
        }else{
            throw new NotFound("Permisssion not found")
        }

        var a_permission = await UserPermission.findOne({ where: where});

        if(a_permission){
            a_permission.removed_at = date;
            a_permission.save();
        }

        return a_permission;
    },
    hasPermission: async (permission_name, user_id) => {
        var user = await sUser.getCache(user_id);

        if(user.permissions && user.permissions[permission_name]){
            return true;
        }else{
            return false;
        }
    },
    hasAnyPermission: async (permissions, user_id) => {
        var user = await sUser.getCache(user_id);

        if(typeof permissions === 'string' && permissions.indexOf("|") > -1){
            permissions = await helpers.convertPipeToArray(permissions)
        }

        if(typeof permissions === 'string'){
            if(user['permissions']){
                var has_permission = false;
                for( var i in user['permissions']){
                    if(user['permissions'][i] == permissions){
                        has_permission = true;
                        break;
                    }
                }

                if(has_permission){
                    return true;
                }else{
                    return false;
                }
            }
        }else if (Array.isArray(permissions)){
            if(user['permissions']){
                for( var i in permissions){
                    if(user['permissions'][permissions]){
                        return true;
                        break;
                    }
                }
            }else{
                return false;
            }
        }else{
            return false;
        }
    },
    hasAllPermissions: async (permissions, user_id) => {
        var user = await sUser.getCache(user_id);

        if(typeof permissions === 'string' && permissions.indexOf("|") > -1){
            permissions = await helpers.convertPipeToArray(permissions)
        }

        if(typeof permissions === 'string'){
            if(user['permissions'][permissions]){
                return true;
            }else{
                return false;
            }
        }else if (Array.isArray(permissions)){
            for( var i in permissions){
                if(user['permissions'][permissions]){
                    return true;
                    break;
                }
            }
        }else{
            return false;
        }

    },
    getCurrentPermissions: async (user_id) => {
        const user = await User.findOne({ where: {id: user_id}, include: 'permissions'});

        var permissions = [];
        for(var i in user.permissions){
            permissions.push({
                id: user.permissions[i].id,
                name: user.permissions[i].name,
                label: user.permissions[i].label,
            })
        }

        return permissions;
    },
    // permissions: async (user_id) => {

    // }
    
}
