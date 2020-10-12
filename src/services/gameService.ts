import Game, { IGame, IGameModel } from '../models/Game'

import apiService from './apiService'


export const [get, getOne] = apiService.constructModelGetters<IGameModel>({
	Model: Game,
	availableSelectOptions: '_id status winner board createdAt modifiedAt index',
	availableSortOptions: 'status winner createdAt modifiedAt',
})


export function finish(game: IGameModel, dto: { winner: IGame['winner']; board: IGame['board'] }): void {
	game.winner = dto.winner
	game.board = dto.board
	game.status = 'finished'
	game.modifiedAt = new Date()
}


export default {
	get, getOne,
	finish,
}
