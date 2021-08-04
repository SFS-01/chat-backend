const { NotFound } = require("../misc/exceptions");
const { Role, UserRole, User } = require("../models");
const usersService = require("./usersService");

module.exports = {
    getRolesFromSQLByUserID: async (id) => {
        var roles = [];
        var sql = "SELECT `user_role`.`role_id`, `user_role`.`restrictable_type`, GROUP_CONCAT(`user_role`.`restrictable_id`) AS 'restrictables', ANY_VALUE(`roles`.`name`) AS 'name' FROM `user_role`" 
            sql +=" JOIN `roles` on `user_role`.`role_id` = `roles`.`id`"
            sql +=" WHERE `user_id` = :id AND `user_role`.`removed_at`  IS NULL"
            sql +=" GROUP BY `role_id`, `user_role`.`restrictable_type`";

        var _roles =  await sequelize.query(sql, {
                replacements: { id: id },
                type: QueryTypes.SELECT
            }
        );

        for(var i in _roles){
            if(!roles[_roles[i]['name']]){
                roles[_roles[i]['name']] = []
            }
            if(_roles[i]['restrictable_type']){
                roles[_roles[i]['name']][_roles[i]['restrictable_type']] = helpers.getValue(_roles[i], 'restrictables', '').split(',')
            }
        }

        return roles;
    },
    assignRole: async (user_id, role, options) => {
        var date = moment().format('YYYY-MM-DD HH:mm:ss');

        //TODO
        /************* Implement restrictable functionality *************/

        var where = {
            user_id: user_id,
            removed_at: null
        }

        if(typeof role === 'string' || role instanceof String){
            var _role = await Role.findOne({where: {name : role}});
            if(!_role){
                throw new NotFound("Role not found")
            }
            where['role_id'] = _role.id;
        }else if(Number.isInteger(role)){
            where['role_id'] = _role.id;
        } else if(!role instanceof Role){
            where['role_id'] = _role.id;
        }else{
            throw new NotFound("Role not found")
        }

        var a_role = await UserRole.findOne({ where: where});

        if(a_role){
            a_role.assigned_at = date;
            a_role.save();
        }else{
            where['assigned_at'] = date;
            a_role = await UserRole.create(where)
        }

        usersService.refreshUserCache(user_id);

        return a_role;
    },
    removeRole: async (user_id, role, options) => {
        var date = moment().format('YYYY-MM-DD HH:mm:ss');

        //TODO
        /************* Implement restrictable functionality *************/

        var where = {
            user_id: user_id,
            removed_at: null
        }

        if(typeof role === 'string' || role instanceof String){
            var _role = Role.findOne({where: {name : role}});
            if(!_role){
                throw new NotFound("Role not found")
            }
            where['role_id'] = _role.id;
        }else if(Number.isInteger(role)){
            where['role_id'] = _role.id;
        } else if(!role instanceof Role){
            where['role_id'] = _role.id;
        }else{
            throw new NotFound("Role not found")
        }

        var a_role = await UserRole.findOne({ where: where});

        if(a_role){
            a_role.removed_at = date;
            a_role.save();
        }

        return a_role;
    },
    hasRoles: async (roles, user_id) => {
        var user = await usersService.getCache(user_id);

        if(typeof roles === 'string' && roles.indexOf("|") > -1){
            roles = await helpers.convertPipeToArray(roles)
        }
        console.log(user)
        if(typeof roles === 'string'){
            if(user['roles']){
                var has_permission = false;
                for( var i in user['roles']){
                    if(user['roles'][i] == roles){
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
        }else if (Array.isArray(roles)){
            if(user['roles']){
                for( var i in roles){
                    if(user['roles'][roles]){
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
    hasAnyRole: async (roles, user_id) => {
        return await module.exports.hasRoles(roles, user_id);
    },
    hasAllRoles: async (roles, user_id) => {
        var user = await sUser.getCache();

        if(typeof roles === 'string' && roles.indexOf("|") > -1){
            roles = await helpers.convertPipeToArray(roles)
        }

        if(typeof roles === 'string'){
            if(user['roles'][roles]){
                return true;
            }else{
                return false;
            }
        }else if (Array.isArray(roles)){
            for( var i in roles){
                if(user['roles'][roles]){
                    return true;
                    break;
                }
            }
        }else{
            return false;
        }

    },
    getCurrentRoles: async (user_id) => {
        const user = await User.findOne({ where: {id: user_id}, include: 'roles'});

        var roles = [];
        for(var i in user.roles){
            roles.push({
                id: user.roles[i].id,
                name: user.roles[i].name,
                label: user.roles[i].label,
            })
        }

        return roles;
    },
    // roles: async (user_id) => {

    // }
    
}
