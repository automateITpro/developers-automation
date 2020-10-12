import express from 'express'
import wrap from 'express-async-wrap'

import Game from '../models/Game'
import Event from '../models/Event'

import gameService from '../services/gameService'
import eventService from '../services/eventService'
import { validateJSON } from '../util'


const router = express.Router()


router.get('/:id', wrap(async function (req, res) {
	const game = await gameService.getOne({
		id: req.params.id, lean: true, restApi: true,
		query: req.query,
	})
	res.json(game)
}))


router.post('/', wrap(async function (req, res) {
	const NOW = new Date()

	const game = new Game({
		createdAt: NOW,
		status: 'started',
		winner: '',
		board: [['', '', ''], ['', '', ''], ['', '', '']],
	})

	await game.save()

	const event = new Event({ createdAt: NOW })
	eventService.update(event, { game: game._id, action: 'started' })
	await event.save()

	res.set('Location', `${req.baseUrl}/${game._id}`)
	res.sendStatus(201)
}))


const finishGameSchema = {
	type: 'object', properties: {
		board: {
			type: 'array', required: true, minItems: 3, maxItems: 3,
			items: {
				type: 'array', required: true, minItems: 3, maxItems: 3,
				items: { type: 'string', enum: ['', 'X', 'O'] },
			},
		},
		winner: { type: 'string', minLength: 3, maxLength: 64 },
	},
	additionalProperties: false,
}


router.post('/:id/finished', wrap(async function (req, res) {
	validateJSON(req.body, finishGameSchema)

	const game = await gameService.getOne({ id: req.params.id, restApi: true })
	gameService.finish(game, { winner: req.body.winner, board: req.body.board })
	await game.save()

	const event = new Event({ createdAt: new Date() })
	eventService.update(event, { game: game._id, action: 'finished' })
	await event.save()

	res.set('Location', `${req.baseUrl}/${game._id}`)
	res.sendStatus(201)
}))


router.get('/:id/events', wrap(async function (req, res) {
	const game = await gameService.getOne({ id: req.params.id, lean: true, restApi: true })

	const events = await eventService.get({
		predicate: { game: game._id }, query: req.query,
		req, res, lean: true,
	})

	res.json(events)
}))


router.delete('/:id', wrap(async function (req, res) {
	const game = await gameService.getOne({ id: req.params.id, lean: false, restApi: true })

	await game.remove();

	res.sendStatus(204);
}))


export default router
