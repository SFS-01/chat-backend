const { BadRequest, ApiException } = require("../misc/exceptions");
const { UserActivityLog } = require("../models");

module.exports = {
    insert: (subject_id, subject_type, action, description, before, after, creator) => {

        UserActivityLog.create({
            subject_id: subject_id,
            subject_type: subject_type,
            action: action,
            description: description,
            before: before,
            after: after,
            user_id: (creator && creator.id) ? creator.id : 0,
            name: (creator && creator.firstname) ? creator.firstname + (creator.lastname ? ' '+creator.lastname : '') : null,
            ip_address: (creator && creator.ip) ? creator.ip : null 
        })
    }
}
