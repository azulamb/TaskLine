import * as express from 'express';

class API
{
	private router: express.Router;

	constructor()
	{
		this.router = express.Router();
	}

	private session( email: string ): Promise<{}>
	{
		if ( !email ) { return Promise.reject( { message: 'No session.' } ); }
		return Promise.resolve( {} );
	}

	private getUserMail( req: express.Request ): string { if ( !(<any>req).session.passport || !(<any>req).session.passport.user ) { return ''; } return (<any>req).session.passport.user.email || ''; }

	private error( res: express.Response, code: number, error: {} )
	{
		res.statusCode = code;
		res.json( error );
	}

	public errorResponce()
	{
		return ( req: express.Request, res: express.Response, next: express.NextFunction ) =>
		{
			// TODO: error
			this.error( res, 500, { message: '' } );
		};
	}

	// ======================================== //
	// API Register                             //
	// ======================================== //

	private get( path: string, func: ( req: express.Request, res: express.Response, next: express.NextFunction ) => void )
	{
		this.router.get( path, func, this.errorResponce() );
	}

	public getRouter(): express.Router { return this.router; }

	// ======================================== //
	// API                                      //
	// ======================================== //

	private userInfo()
	{
		return ( req: express.Request, res: express.Response, next: express.NextFunction ) =>
		{
			res.json( (<any>req).session.passport.user || {} );
		}
	}

	// ======================================== //
	// Add API                                  //
	// ======================================== //

	public init()
	{
		this.get( '/user', this.userInfo() );
	}
}

export = API;
