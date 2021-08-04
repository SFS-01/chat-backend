const api = require('../misc/api')
const sFile = require('../services/fileService')
const multiparty = require('multiparty');
const fs = require('fs');

module.exports = {
	list: async (req, res, next) => {
		try {
			var data = req.body;
			const results = await sFile.search(data)
			res.send(api.success('File list', results.data, results.pagination))
		} catch (err) {
			next(err)
		}
	},
	store: async (req, res, next) => {
		try {
			await helpers.multipart(req, async (files) => {
				let data = [];
				for (const key in files) {
					for (const i in files[key]) {
						file = await sFile.store(files[key][i]);
						data.push(file.dataValues);
					}
				}

				if (data.length > 1) {
					res.send(api.success('File was successfully created', data));
				} else if (data.length > 0) {
					res.send(api.success('File was successfully created', data[0]));
				} else {
					throw new NotFound("File not found.")
				}
			});
		} catch (err) {
			next(err);
		}
	},
	getFile: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new NotFound("File not found.")
			}
			const file = await sFile.show(req.params.id);

			let path = app_root + file.path;

			var stat = fs.statSync(path);

			res.writeHead(200, {
				'Content-Type': file.type,
				'Content-Length': stat.size
			});

			var readStream = fs.createReadStream(path);
			readStream.pipe(res);
		} catch (err) {
			next(err);
		}
	},
	show: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new NotFound("File not found.")
			}
			const file = await sFile.show(req.params.id);
			res.send(api.success('File detail', file));
		} catch (err) {
			next(err);
		}
	},
	delete: async (req, res, next) => {
		try {
			if (!req.params.id) {
				throw new NotFound("File ID is required.")
			}
			let force = false;
			if (req.query.force) {
				force = req.query.force;
			}
			const file = await sFile.delete(req.params.id, force);
			res.send(api.success('File was successfully deleted', file.dataValues));
		} catch (err) {
			next(err);
		}
	}
}