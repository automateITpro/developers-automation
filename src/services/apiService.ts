import { Response, Request } from 'express'
import { Model as MongooseModel } from 'mongoose'
import { escapeRegExp, validateId } from '../util'


function limitSort(sort = '', options = ''): string {
	const optionsList = options.split(' ')
	const sortProperty = sort[0] === '-' ? sort.substr(1) : sort
	return optionsList.includes(sortProperty) ? sort : optionsList[0]
}


function getSort(sort: string, availableSortOptions: string): string {
	if (!sort || !availableSortOptions) {
		return null
	}
	return limitSort(sort, availableSortOptions)
}


function getSelect(select: string, availableSelectOptions: string): string {
	if (!select) {
		return availableSelectOptions
	}

	return select
		.split(' ')
		.filter(x => availableSelectOptions
			.split(' ')
			.includes(x))
		.join(' ')
}


function getPaging(query: IGetQuery): { size: number; page: number } {
	const size = Math.min(Math.max((query.size | 0) || 10, 1), 100)
	const page = (query.page | 0) || 0
	return { size, page }
}


function getFreeSearchPredicate(words: string): any[] {
	const predicates = (words || '')
		.substr(0, 256)
		.split(' ')
		.filter(x => x)
		.map(word => ({ index: new RegExp(escapeRegExp(word), 'i') }))
	return predicates.length ? predicates : [{}]
}


interface IGetQuery {
	page?: number;
	size?: number;
	search?: string;
	sort?: string;
	select?: string;
}


interface IPopulate {
	model?: string;
	path: string;
	select: string;
}


interface IGetterConstants {
	Model: MongooseModel<any>;
	availableSelectOptions: string;
	availableSortOptions: string;
}


interface IGetterConditions {
	query: IGetQuery;
	id?: string;
	res?: Response;
	req?: Request;
	lean?: boolean;
	populate?: IPopulate[];
	predicate?: any;
	restApi?: boolean;
}


interface IGetter extends IGetterConstants, IGetterConditions { }


interface IGetOne {
	id: IGetter['id'];
	lean?: IGetter['lean'];
	populate?: IGetter['populate'];
	predicate?: IGetter['predicate'];
	restApi?: IGetter['restApi'];
	query?: IGetter['query'];
}


async function get<T>({ Model, populate,
	availableSelectOptions, availableSortOptions,
	query, req, res, id, lean, ...rest }: IGetter): Promise<T[]> {
	const predicate: any = {
		...(rest.predicate || {}),
	}

	if (id) {
		validateId(id)
		predicate._id = id
	}

	if (query.search) {
		predicate.$and = getFreeSearchPredicate(query.search)
	}

	if (req && res && req.headers['return-total-count'] === 'true') {
		res.set('Total-Count', String(await Model.countDocuments(predicate)))
	}

	const sort = getSort(query.sort, availableSortOptions)
	const select = getSelect(query.select, availableSelectOptions)

	const { size, page } = getPaging(query)

	const q = Model.find(predicate)

	if (populate) { q.populate(populate) }
	if (sort) { q.sort(sort) }
	if (lean) { q.lean(lean) }

	q.limit(size)
	q.skip(page * size)
	q.select(select)


	if (id && rest.restApi) {
		const [result] = await q
		if (!result) { throw new Error('NotFound') }
		return [result]
	}

	return await q
}


export function constructModelGetters<T>(options: IGetterConstants): [
	(options: IGetterConditions) => Promise<T[]>,
	(options: IGetOne) => Promise<T>,
] {
	function getAll(rest: IGetterConditions): Promise<T[]> {
		return get<T>({ ...options, ...rest })
	}

	async function getOne(rest: IGetOne): Promise<T> {
		const [res] = await get<T>({ ...options, query: { size: 1, page: 0 }, ...rest })
		return res
	}

	return [getAll, getOne]
}


export default {
	constructModelGetters,
}
