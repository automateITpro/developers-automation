
declare namespace Express {
	export interface Request { // eslint-disable-line @typescript-eslint/interface-name-prefix
		user: any;
		cookieToken: string;
	}
}
