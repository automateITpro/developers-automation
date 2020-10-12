import 'mocha'

import request from 'supertest'
import assert from 'assert'

import util from '../util'
import models, { createEvent, createEventDTO, mId, createGame, createGameDTO } from '../create'

import app from '../../src/app'


describe('/api/events', function () {
	beforeEach(util.clearTestingData)

	describe('GET /api/events/:id', function () {
		it('should throw NotFound when no documents are in database', async function () {
			await request(app)
				.get(`/api/events/${mId('1')}`)
				.expect(404, { message: 'NotFound' })
		})

		it('should throw NotFound when no event is found by given _id', async function () {
			await createEvent()

			await request(app)
				.get(`/api/events/${mId('1')}`)
				.expect(404, { message: 'NotFound' })
		})

		it('should throw ValidationError when invalid format mongo id is given', async function () {
			await request(app)
				.get('/api/events/mongoid')
				.expect(400, { message: 'ValidationError', extra: 'mongoid does not look like mongo object id' })
		})

		it('should return document matched by _id', async function () {
			const doc = await createEvent()

			await request(app)
				.get(`/api/events/${doc._id}`)
				.expect(200)
		})

		it('should return only in query selected options', async function () {
			const doc = await createEvent({
				...createEventDTO(),
				action: 'finished',
				player: 'Player O',
				row: 0,
				column: 0,
			})

			await request(app)
				.get(`/api/events/${doc._id}`)
				.query({ select: 'action player row column' })
				.expect(200, {
					_id: doc._id.toString(),
					action: 'finished',
					player: 'Player O',
					row: 0,
					column: 0,
				})
		})
	})

	describe('POST /api/events', function () {
		it('should throw ValidationError when bad dto was sent', async function () {
			await request(app)
				.post('/api/events')
				.send({
					action: 'action',
					player: '12',
					row: '1',
					column: 3,
					game: 'whatsmongo',
				})
				.expect(400, {
					message: 'ValidationError', extra: [
						'instance.action is not one of enum values: checked,started,finished',
						'instance.player does not meet minimum length of 3',
						'instance.row is not of a type(s) integer',
						'instance.column must have a maximum value of 2',
						'instance.game does not match pattern "/^[0-9a-f]{24}$/"',
					].join(', '),
				})
		})

		it('should throw ValidationError when requested game does not exist', async function () {
			await request(app)
				.post('/api/events')
				.send({
					action: 'checked',
					player: 'Player X',
					row: 1,
					column: 2,
					game: mId('1'),
				})
				.expect(400, { message: 'ValidationError', extra: 'GameNotFound' })
		})

		it('should throw ValidationError when game has already finished', async function () {
			const game = await createGame({
				...createGameDTO(),
				status: 'finished',
			})

			await request(app)
				.post('/api/events')
				.send({
					action: 'checked',
					player: 'Player X',
					row: 1,
					column: 2,
					game: game._id,
				})
				.expect(400, { message: 'ValidationError', extra: 'GameHasAlreadyFinished' })
		})

		it('should create Event as requested and link it to game', async function () {
			const game = await createGame()

			const { header } = await request(app)
				.post('/api/events')
				.send({
					action: 'checked',
					player: 'Player X',
					row: 1,
					column: 2,
					game: game._id,
				})
				.expect(201)
				.expect('Created')

			const createdId = header['location'].split('/').pop()
			const createdResource = await models.Event.findById(createdId)
				.select('-_id action player row column').lean()

			assert.deepStrictEqual(createdResource, {
				action: 'checked',
				player: 'Player X',
				row: 1,
				column: 2,
			})
		})
	})
})
