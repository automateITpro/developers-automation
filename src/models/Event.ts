import { Schema, Document, Model, model } from 'mongoose'


export interface IEvent {
	action: 'checked' | 'started' | 'finished';
	player?: string;
	row?: number;
	column?: number;
	game: any;
	createdAt?: Date;
	modifiedAt?: Date;
}


export interface IEventModel extends IEvent, Document {
	createdAt: Date;
	modifiedAt: Date;
	index: string;
}


const schema: Schema = new Schema({
	action: { type: String, enum: ['checked', 'started', 'finished'] },
	player: { type: String },
	createdAt: { type: Date, default: Date.now },
	modifiedAt: { type: Date, default: Date.now },
	row: { type: Number },
	column: { type: Number },
	game: { type: Schema.Types.ObjectId },
	index: { type: String },
})


schema.pre<IEventModel>('save', function () {
	this.index = [this.action, this.player].join(' ')
})


const Event: Model<IEventModel> = model<IEventModel>('Event', schema)


export default Event
