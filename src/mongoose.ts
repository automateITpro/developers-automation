import mongoose from 'mongoose'


import config from '../config'
import logger from './logger'


mongoose
	.connect(config.mongoConnectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => { logger.info('mongo connected') })
	.catch(err => { logger.error('mongo failed to connect', { error: err }) })


export default mongoose
