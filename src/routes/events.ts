import express from 'express'
import wrap from 'express-async-wrap'

import Event, { IEvent } from '../models/Event'
import ValidationError from '../errors/ValidationError'

import eventService, { update } from '../services/eventService'
import gameService from '../services/gameService'
import { validateJSON } from '../util'


const router = express.Router()


router.get('/:id', wrap(async function (req, res) {
	const event = await eventService.getOne({
		id: req.params.id, lean: true, restApi: true, query: req.query,
	})
	res.json(event)
}))


const createEventSchema = {
	type: 'object', properties: {
		action: { type: 'string', required: true, enum: ['checked', 'started', 'finished'] },
		player: { type: 'string', required: true, minLength: 3, maxLenght: 64 },
		row: { type: 'integer', required: true, minimum: 0, maximum: 2 },
		column: { type: 'integer', required: true, minimum: 0, maximum: 2 },
		game: { type: 'string', required: true, pattern: /^[0-9a-f]{24}$/ },
	},
	additionalProperties: false,
}


router.post('/', wrap(async function (req, res) {
	validateJSON(req.body, createEventSchema)

	const game = await gameService.getOne({ lean: true, query: { select: '_id status' }, id: req.body.game })

	if (!game) { throw new ValidationError('GameNotFound') }
	if (game.status === 'finished') { throw new ValidationError('GameHasAlreadyFinished') }

	const event = new Event({ createdAt: new Date() })

	update(event, req.body as IEvent)
	await event.save()

	res.set('Location', `${req.baseUrl}/${event._id}`)
	res.sendStatus(201)
}))


export default router
