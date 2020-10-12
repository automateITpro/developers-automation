import { Validator } from 'jsonschema'
import ValidationError from './errors/ValidationError'

const v = new Validator()

export const MONGO_ID_PATTERN = /^[0-9a-f]{24}$/


export function validateJSON(object: object, schema: object): void {
	const validationResult = v.validate(object, schema)
	if (validationResult.errors.length > 0) {
		throw new ValidationError(validationResult.errors.join(', '))
	}
}


export function validateId(id: string): void {
	if (!MONGO_ID_PATTERN.test(id)) {
		throw new ValidationError(`${id} does not look like mongo object id`)
	}
}


export function escapeRegExp(str: string): string {
	return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}
