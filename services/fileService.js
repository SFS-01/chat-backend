const { File } = require("../models");
const { BadRequest, ApiException, NotFound } = require("../misc/exceptions");
const queries = require("../misc/queries");
const mime = require('mime-types');
const fs = require('fs');
const { createHmac } = require("crypto");

module.exports = {
    search: async (data) => {
        var options = await queries.standardize_search(data);
        return await queries.findAll(File, options);
    },
    store: async (data, owner_type, owner_id) => {
        var current_date = (new Date()).valueOf().toString();
        const hash = await createHmac('sha256', 'MaqX7jk33MvUAPt4')
            .update(data.originalFilename + current_date)
            .digest('hex');
        let filename = '';
        let type = mime.lookup(data.path);
        if (type == false) {
            type = 'unknown';
            filename = hash + '.' + type;
        } else {
            filename = hash + '.' + mime.extension(type);
        }

        if (!fs.existsSync(`${app_root}/storage/files`)) {
            fs.mkdirSync(`${app_root}/storage/files`)
        }
        let path = `/storage/files/${filename}`;

        var readStream = fs.createReadStream(data.path);
        var writeStream = fs.createWriteStream(app_root + path);
        readStream.pipe(writeStream);
        readStream.on('end', function () {
            fs.unlinkSync(data.path);
        });
        const file = await File.create({
            uid: hash,
            owner_type: owner_type,
            owner_id: owner_id,
            type: type,
            filename: filename,
            path: path,
            file_size: data.size
        })

        return file; //returning only the values
    },
    show: async (uid) => {

        const file = await File.findOne({ where: { uid: uid } });

        if (file !== null) {
            return file;
        }

        throw new NotFound('File not found.')
    },
    delete: async (uid, force = false) => {

        let _file = await File.findOne({ where: { uid: uid } });

        if (_file) {
            if (force) {
                let file_path = app_root + _file.path;
                await _file.destroy({
                    'force': force
                });
                fs.unlink(file_path, function (err) {
                    if (err) throw err;
                })
            } else {
                await _file.destroy({
                    'force': force
                });
            }
            return true;
        }
        throw new ApiException('File could not be deleted.')

    }
}
