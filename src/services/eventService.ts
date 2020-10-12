import Event, { IEvent, IEventModel } from '../models/Event'

import apiService from './apiService'


export const [get, getOne] = apiService.constructModelGetters<IEventModel>({
	Model: Event,
	availableSelectOptions: '_id action player row column modifiedAt createdAt index game',
	availableSortOptions: 'action player createdAt modifiedAt row column',
})


export function update(model: IEventModel, dto: IEvent): void {
	model.action = dto.action
	model.player = dto.player
	model.row = dto.row
	model.column = dto.column
	model.game = dto.game
	model.modifiedAt = new Date()
}


export default {
	get, getOne,
	update,
}
