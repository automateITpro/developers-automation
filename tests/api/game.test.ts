import 'mocha'

import request from 'supertest'
import assert from 'assert'

import util from '../util'
import models, { createGame, createGameDTO, createEvent, createEventDTO, mId, mapEventToTestDTO } from '../create'

import app from '../../src/app'


describe('/api/games', function () {
	beforeEach(util.clearTestingData)

	describe('GET /api/games/:id', function () {
		it('should throw NotFound when no documents are in database', async function () {
			await request(app)
				.get(`/api/games/${mId('1')}`)
				.expect(404, { message: 'NotFound' })
		})

		it('should throw NotFound when no game is found by given _id', async function () {
			await createGame()

			await request(app)
				.get(`/api/games/${mId('1')}`)
				.expect(404, { message: 'NotFound' })
		})

		it('should throw ValidationError when invalid format mongo id is given', async function () {
			await request(app)
				.get('/api/games/mongoid')
				.expect(400, { message: 'ValidationError', extra: 'mongoid does not look like mongo object id' })
		})

		it('should return document matched by _id', async function () {
			const doc = await createGame()

			await request(app)
				.get(`/api/games/${doc._id}`)
				.expect(200)
		})

		it('should return only in query selected options', async function () {
			const doc = await createGame({
				...createGameDTO(),
				status: 'finished',
				winner: 'Player O',
			})

			await request(app)
				.get(`/api/games/${doc._id}`)
				.query({ select: 'status winner' })
				.expect(200, {
					_id: doc._id.toString(),
					status: 'finished',
					winner: 'Player O',
				})
		})
	})

	describe('GET /api/games/:id/events', function () {
		it('should throw ValidationError when invalid format mongo id is given', async function () {
			await request(app)
				.get('/api/games/mongoid/events')
				.expect(400, { message: 'ValidationError', extra: 'mongoid does not look like mongo object id' })
		})

		it('should throw NotFound error when game by given id does not exists', async function () {
			await request(app)
				.get(`/api/games/${mId('1')}/events`)
				.expect(404, { message: 'NotFound' })
		})

		it('should return empty array when no events are in database', async function () {
			const doc = await createGame()

			await request(app)
				.get(`/api/games/${doc._id}/events`)
				.set('Return-Total-Count', 'true')
				.expect('total-count', '0')
				.expect(200, [])
		})

		it('should return empty array when all created events do not belong to given game', async function () {
			const doc = await createGame()

			await Promise.all([
				createEvent(),
				createEvent(),
				createEvent(),
			])

			await request(app)
				.get(`/api/games/${doc._id}/events`)
				.set('Return-Total-Count', 'true')
				.expect('total-count', '0')
				.expect(200, [])
		})

		it('should return all given id game events', async function () {
			const doc = await createGame()

			const [e1, e2] = [
				await	createEvent({ ...createEventDTO(), game: doc._id }),
				await createEvent({ ...createEventDTO(), game: doc._id }),
				await createEvent(),
			]

			await request(app)
				.get(`/api/games/${doc._id}/events`)
				.query({ sort: 'createdAt' })
				.set('Return-Total-Count', 'true')
				.expect('total-count', '2')
				.expect(200)
				.expect(res =>
					assert.deepStrictEqual(res.body.map(mapEventToTestDTO), [e1, e2].map(mapEventToTestDTO)))
		})
	})

	describe('POST /api/games', function () {
		it('should create new game in database and event linked to it', async function () {
			const { header } = await request(app)
				.post('/api/games')
				.expect('Content-Type', 'text/plain; charset=utf-8')
				.expect(201)
				.expect('Created')

			const createdResourceId = header['location'].split('/').pop()

			const createdResource = await models.Game.findById(createdResourceId)
			const events = await models.Event.find({ game: createdResourceId })

			assert(createdResource)

			assert.deepStrictEqual(events.map(mapEventToTestDTO), [{
				game: createdResourceId,
				action: 'started',
				createdAt: createdResource.createdAt,
			}].map(mapEventToTestDTO))
		})
	})

	describe('POST /api/games/:id/finished', async function () {
		it('should throw ValidationError with explanation when bad DTO was sent', async function () {
			await request(app)
				.post(`/api/games/${mId('1')}/finished`)
				.send({ board: [], winner: [] })
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(400, {
					message: 'ValidationError', extra: [
						'instance.board does not meet minimum length of 3',
						'instance.winner is not of a type(s) string',
					].join(', '),
				})

			await request(app)
				.post(`/api/games/${mId('1')}/finished`)
				.send({ board: [['Y', 'Y', 'Y'], ['X', 'X', 'X'], ['X', 'X', 'X']], winner: 'winnawinnachickendinna' })
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(400, {
					message: 'ValidationError', extra: [
						'instance.board[0][0] is not one of enum values: ,X,O',
						'instance.board[0][1] is not one of enum values: ,X,O',
						'instance.board[0][2] is not one of enum values: ,X,O',
					].join(', '),
				})
		})

		it('should throw NotFound when resource by given _id does not exist', async function () {
			const { board, winner } = createGameDTO()

			await request(app)
				.post(`/api/games/${mId('1')}/finished`)
				.send({ board, winner })
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(404, { message: 'NotFound' })
		})

		it('should throw ValidationError when bad format mongo _id was sent', async function () {
			const { board, winner } = createGameDTO()

			await request(app)
				.post('/api/games/mongoid/finished')
				.send({ board, winner })
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(400, { message: 'ValidationError', extra: 'mongoid does not look like mongo object id' })
		})

		it('should mark game as finished and create event linked to game when everything is successful', async function () {
			const { header } = await request(app)
				.post('/api/games')
				.expect('Content-Type', 'text/plain; charset=utf-8')
				.expect(201)
				.expect('Created')

			const createdResourceId = header['location'].split('/').pop()

			await request(app)
				.post(`/api/games/${createdResourceId}/finished`)
				.send({
					board: [
						['X', 'O', 'X'],
						['X', 'O', 'X'],
						['O', 'X', 'O'],
					],
					winner: 'tie',
				})
				.expect('Content-Type', 'text/plain; charset=utf-8')
				.expect('Location', `/api/games/${createdResourceId}`)
				.expect(201)
				.expect('Created')

			const createdResource = await models.Game.findById(createdResourceId)
			const events = await models.Event.find({ game: createdResourceId }).select('action game')

			assert.deepStrictEqual(createdResource.status, 'finished')
			assert.deepStrictEqual([...createdResource.board], [
				['X', 'O', 'X'],
				['X', 'O', 'X'],
				['O', 'X', 'O'],
			])

			assert.deepStrictEqual(events.map(mapEventToTestDTO), [
				{ game: createdResourceId, action: 'started' },
				{ game: createdResourceId, action: 'finished' },
			].map(mapEventToTestDTO))
		})
	})
})
