import * as express from 'express';
import * as passport from'passport';
import * as Google from 'passport-google-oauth';
import * as session from 'express-session';

module Auth
{
	export interface UserData
	{
		id: string,
		name: string,
		email: string,
		image: string,
		type: number,
	};

	export interface DB
	{
		getUser( email:string ): Promise<{}>;
		canAddUser( email:string ): Promise<boolean>;
		addUser( data: UserData ): Promise<{}>;
	}

	export class AuthRoute
	{
		private app: express.Express;

		constructor( app: express.Express, secret: string )
		{
			this.app = app;
			this.app.use( passport.initialize() );
			this.app.use( passport.session() );
			this.app.use( session( { secret: secret } ) );
		}

		public setUpAuth( app: express.Express, db: DB, GOOGLE_DATA: Google.IOAuth2StrategyOption, scope: string[] )
		{
			passport.serializeUser( ( user, done ) =>{ done( null, this.remakeUser( <Google.Profile>user ) ); } );

			passport.deserializeUser( (obj, done) => { done( null, obj ); } );

			passport.use( new Google.OAuth2Strategy( GOOGLE_DATA, ( accessToken: string, refreshToken: string, profile: Google.Profile, done: any ) =>
			{
				(<any>profile).token = accessToken;
				(<any>profile).token_secret = refreshToken;
				db.getUser( this.getMail( profile ) ).then( ( result ) =>
				{
					// Exists user.
					return Promise.resolve( profile );
				} ).catch( ( error ) =>
				{
					// Not exists user.
					return db.canAddUser( this.getMail( profile ) ).then( ( result ) =>
					{
						if ( !result ) { return Promise.reject( {} ); }
						db.addUser( this.remakeUser( profile ) );
						return Promise.resolve( profile );
					} ).catch( ( error ) => { return Promise.resolve( null ); } );
				} ).then( ( result ) =>
				{
					// End.
					done( null, result );
				} );
			} ) );

			this.app.get( '/auth/google', passport.authenticate( 'google', { scope: scope } ) );
			this.app.get( '/auth/google/callback', passport.authenticate( 'google', { successRedirect: '/', failureRedirect: '/?error=login' } ) );
			this.app.get( '/auth/logout', ( req: express.Request, res: express.Response ) => { (<any>req.session).destroy(); res.redirect( '/?type=logout' ); } );
		}

		public auth( redirect: boolean = true )
		{
			return ( req: express.Request, res: express.Response, next: express.NextFunction ) =>
			{
				// TODO: redirect now page.
				if( !this.isLogin( req ) )
				{
					if ( redirect ) { return res.redirect( '/' ); }
					return this.timeout( res );
				}
				return next();
			}
		}

		private timeout( res: express.Response )
		{
			res.statusCode = 500;
			res.json( { message: 'Timeout' } );
		}

		private getMail( profile: Google.Profile ): string
		{
			if ( !profile.emails ){ return '';}
			const list = profile.emails;
			for ( let i = 0 ; i < list.length ; ++i ) { if ( list[ i ].type === 'account' ) { return list[ i ].value; } }
			return '';
		}

		private getImage( profile: Google.Profile ): string
		{
			if ( !profile.photos || profile.photos.length <= 0 ){ return ''; }
			return profile.photos[ 0 ].value;
		}

		private getSessionData( req: express.Request ): UserData
		{
			if ( !(<any>req.session).passport || !(<any>req.session).passport.user )
			{
				return { id:'',name:'',email:'',image:'',type:0 };
			}
			return ( <UserData>(<any>req.session).passport.user );
		}

		private remakeUser( profile: Google.Profile, type?: number )
		{
			const user: UserData =
			{
				id: profile.id,
				name: profile.displayName,
				email: this.getMail( profile ),
				image: this.getImage( profile ),
				type: type || 0,
			};
			return user;
		}

		private getUserMail( req: express.Request ): string { return this.getSessionData( req ).email || ''; }

		private isLogin( req: express.Request ): boolean { return this.getUserMail( req ) !== ''; }
	}

}


export = Auth;
