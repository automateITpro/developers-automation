import mongoose from 'mongoose'


import Game, { IGame, IGameModel } from '../src/models/Game'
import Event, { IEvent, IEventModel } from '../src/models/Event'


function uniq(): string {
	return Math.floor(Math.random() * 1048576).toString(32)
}


export function id(x?: string): string {
	return ('000000000000000000000000' + x).substr(-24, 24)
}


export function mId(x?: string): mongoose.Types.ObjectId {
	return new mongoose.Types.ObjectId(id(x))
}


export function createGameDTO(): IGame {
	const u = uniq()

	return {
		status: 'started',
		winner: `${u}-winner`,
		board: [['', '', ''], ['', '', ''], ['', '', '']],
	}
}


export async function createGame(data?: IGame): Promise<IGameModel> {
	const game: IGameModel = new Game({
		...createGameDTO(),
		...(data || {}),
	})

	return await game.save()
}


export function createEventDTO(): IEvent {
	const u = uniq()

	return {
		action: 'checked',
		player: `${u}-player`,
		row: 1,
		column: 2,
		game: null,
	}
}


export async function createEvent(data?: IEvent): Promise<IEventModel> {
	const event: IEventModel = new Event({
		...createEventDTO(),
		...(data || {}),
	})

	return await event.save()
}


export function mapEventToTestDTO(event: IEventModel): IEvent {
	return {
		action: event.action,
		player: event.player,
		row: event.row,
		column: event.column,
		game: event.game.toString(),
		createdAt: event.createdAt ? new Date(event.createdAt) : event.createdAt,
	}
}


export function mapGameToTestDTO(game: IGameModel): IGame {
	return {
		status: game.status,
		winner: game.winner,
		board: game.board,
		createdAt: game.createdAt ? new Date(game.createdAt) : game.createdAt,
		modifiedAt: game.modifiedAt ? new Date(game.modifiedAt) : game.modifiedAt,
	}
}


export default {
	Game,
	Event,
}
