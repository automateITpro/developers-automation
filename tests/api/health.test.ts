import 'mocha'

import assert from 'assert'
import request from 'supertest'

import '../util'
import app from '../../src/app'


describe('/api/health', function () {
	describe('GET /api/health', function () {
		it('should respond with os hostname', async function () {
			await request(app)
				.get('/api/health')
				.expect(200)
				.expect('content-type', 'application/json; charset=utf-8')
				.expect(res => {
					assert.deepStrictEqual(res.body, require('os').hostname())
				})
		})
	})
})
