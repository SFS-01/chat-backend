require('dotenv').config()

module.exports = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: process.env.DB_DIALECT,
		apiPort: process.env.PORT || 3000,
		migrationStorageTableName: "sequelize_meta",
	},
	test: {
		username: process.env.TEST_DB_USERNAME,
		password: process.env.TEST_DB_PASSWORD,
		database: process.env.TEST_DB_NAME,
		host: '127.0.0.1',
		dialect: process.env.DB_DIALECT,
		migrationStorageTableName: "sequelize_meta",
	},
	production: {
		username: process.env.PROD_DB_USERNAME,
		password: process.env.PROD_DB_PASSWORD,
		database: process.env.PROD_DB_NAME,
		host: process.env.PROD_DB_HOST,
		dialect: process.env.DB_DIALECT,
		migrationStorageTableName: "sequelize_meta",
	},
	saltingRounds: 6
}


