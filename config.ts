export default {
	siteUrl: process.env.SITE_URL || 'http://localhost:8081',
	httpPort: process.env.HTTP_PORT || 8080,
	mongoConnectionString: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/tic-tac-toe',
	mongoTestsConnectionString: process.env.MONGO_TESTS_CONNECTION_STRING || 'mongodb://localhost:17017/tic-tac-toe-testing',
	logger: {
		index: 'xo-backend',
		logstashHost: process.env.ELASTIC_STACK_LOGSTASH_HOST || 'localhost',
		environment: process.env.ELASTIC_STACK_ENVIRONMENT || 'dev',
	},
}
