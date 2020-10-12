import { Schema, Document, Model, model } from 'mongoose'


export type row = [string, string, string]


export interface IGame {
	status: 'started' | 'finished';
	winner: string;
	board: [row, row, row];
	createdAt?: Date;
	modifiedAt?: Date;
}


export interface IGameModel extends IGame, Document {
	createdAt: Date;
	modifiedAt: Date;
	index: string;
}


const schema: Schema = new Schema({
	status: { type: String, enum: ['started', 'finished'] },
	board: [],
	winner: { type: String },
	createdAt: { type: Date, default: Date.now },
	modifiedAt: { type: Date, default: Date.now },
	index: { type: String },
})


schema.pre<IGameModel>('save', function () {
	this.index = [this.status, this.winner].join(' ')
})


const Game: Model<IGameModel> = model<IGameModel>('Game', schema)


export default Game
