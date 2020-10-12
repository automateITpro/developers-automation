import 'mocha'

import config from '../config'


config.logger.logstashHost = null
config.mongoConnectionString = config.mongoTestsConnectionString


import { Game, Event } from '../src/models'

import logger from '../src/logger'


const _loggerWarn = logger.warn
const _loggerError = logger.error
const _loggerInfo = logger.info


const _warn = console.warn
const _info = console.info
const _error = console.error
const _debug = console.debug

import mongoose from '../src/mongoose'

export async function clearTestingData(): Promise<void> {
	// @ts-ignore
	if (!mongoose.connection.name.includes('testing')) {
		// @ts-ignore
		throw new Error(`Will not delete data from non testing DB '${mongoose.connection.name}'. Configure mongoTestsConnectionString`)
	}

	await Promise.all([
		Game.deleteMany({}),
		Event.deleteMany({}),
	])
}


after(async () => {
	await mongoose.connection.close()
	mongoose.models = {}
	mongoose.connection.removeAllListeners()
	// @ts-ignore
	mongoose.modelSchemas = {}
})



before(() => {
	console.warn = (): void => { }	// eslint-disable-line @typescript-eslint/no-empty-function
	console.error = (): void => { } // eslint-disable-line @typescript-eslint/no-empty-function
	console.info = (): void => { } // eslint-disable-line @typescript-eslint/no-empty-function
	console.debug = (): void => { } // eslint-disable-line @typescript-eslint/no-empty-function
	logger.warn = (): void => { } // eslint-disable-line @typescript-eslint/no-empty-function
	logger.error = (): void => { } // eslint-disable-line @typescript-eslint/no-empty-function
	logger.info = (): void => { } // eslint-disable-line @typescript-eslint/no-empty-function
})


after(() => {
	console.warn = _warn
	console.error = _error
	console.info = _info
	console.debug = _debug
	logger.warn = _loggerWarn
	logger.error = _loggerError
	logger.info = _loggerInfo
})


export default {
	clearTestingData,
}
