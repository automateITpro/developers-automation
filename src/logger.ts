import { Request } from 'express'

import winston from 'winston'
import 'winston-logstash'

import config from '../config'

interface ILogPayload {
	error?: any | Error;
	req?: Request;
	data?: any;
	status?: number;
	stack?: Error['stack'];
}

const transports = []
transports.push(new winston.transports.Console())

// @ts-ignore
const logger = new (winston.Logger)({
	level: 'debug',
	transports,
})

export function log(level: string, message: string, { error, req, data, status, stack }: ILogPayload): void {
	const info: any = req ? {
		url: req.url,
		query: JSON.stringify(req.query || {}),
		body: JSON.stringify(req.body || {}).substring(0, 2048),
		route: req.method.toLowerCase() + ' ' + ((req.route && req.route.path) || req.path),
		ip: req.ip,
	} : {}

	if (status) {
		info.status = status
	}

	if (data) {
		info.data = JSON.stringify(data).substring(0, 2048)
	}

	if (error && error.stack) {
		info.stack = error.stack
	}

	if (stack) { info.stack = stack }

	info.hostname = require('os').hostname()
	info.environment = config.logger.environment

	logger.log(level, message, info)
}

if (config.logger.logstashHost) {
	// @ts-ignore
	const logstash = new winston.transports.Logstash({
		port: 28777,
		node_name: config.logger.index + '-logs', // eslint-disable-line @typescript-eslint/camelcase
		host: config.logger.logstashHost,
	})

	logstash.on('error', function (error: Error) {
		log('error', error.message, { error })
	})

	transports.push(logstash)
}


if (!process.listeners('uncaughtException').length) {
	process.on('uncaughtException', function (error) {
		log('error', error.message, { error })
		setTimeout(() => process.exit(1), 500)
	})
}


export function ERROR(message: string, options?: ILogPayload): void {
	log('error', message, options || {})
}

export function warn(message: string, options?: ILogPayload): void {
	log('warn', message, options || {})
}

export function INFO(message: string, options?: ILogPayload): void {
	log('info', message, options || {})
}

export function debug(message: string, options?: ILogPayload): void {
	log('debug', message, options || {})
}


export default {
	error: ERROR,
	warn,
	info: INFO,
	debug,
	log: logger.log.bind(logger),
}
