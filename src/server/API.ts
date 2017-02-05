import * as express from 'express';
import DB = require( './DB' );

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

	private post( path: string, func: ( req: express.Request, res: express.Response, next: express.NextFunction ) => void )
	{
		this.router.post( path, func, this.errorResponce() );
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

	private taskData()
	{
		return ( req: express.Request, res: express.Response, next: express.NextFunction ) =>
		{
			const data: T_TaskData =
			{
				worker: [],
				task: [],
			};

			data.worker.push( { id: '1', order: 1 , name: 'Plan', color: '#b0c4de'} );
			data.worker.push( { id: '2', order: 2, name: 'Design', color: '#ffb6c1' } );
			data.worker.push( { id: '3', order: 3, name: 'Server', color: '#f6ae54' } );
			data.worker.push( { id: '4', order: 4, name: 'Web', color: '#eddc44' } );
			data.worker.push( { id: '5', order: 5, name: 'Debug', color: '#9acd32' } );

			data.task.push( { id: '1', name: 'test1', begin: new Date().toISOString(), end: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 ).toISOString(), archive: false, memo: [] } );
			data.task.push( { id: '2', name: 'test2', begin: new Date().toISOString(), end: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000 ).toISOString(), archive: false, memo: [] } );

			res.json( data );
		}
	}

	// ======================================== //
	// Add API                                  //
	// ======================================== //

	public init( db: DB )
	{
		this.get( '/user', this.userInfo() );

		this.get( '/task/list', this.taskData() );
		this.post( '/task/add', this.userInfo() );
		this.post( '/task/update', this.userInfo() );

	}
}

export = API;
