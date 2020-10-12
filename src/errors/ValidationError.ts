export default class ValidationError extends Error {
	public extra: string
	public data?: object
	public message: string

	constructor(extra: string, data?: object) {
		super()
		this.message = 'ValidationError'
		this.extra = extra
		this.data = data
	}
}
