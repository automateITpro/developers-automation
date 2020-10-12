import 'dotenv/config'


import config from '../config'
import logger from './logger'


import app from './app'


app.listen(config.httpPort, () => {
	logger.info(`SERVER listening on port ${config.httpPort}`)
})
