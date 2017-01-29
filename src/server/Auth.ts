import * as express from 'express';
import * as passport from'passport';
import * as Google from 'passport-google-oauth';
import * as session from 'express-session';

interface SessionData {
			id: string,
			name: string,
			email: string,
			image: string,
			type: number,
		};

class Auth
{
	private app: express.Express;

	constructor( app: express.Express, secret: string )
	{
		this.app = app;
		this.app.use( passport.initialize() );
		this.app.use( passport.session() );
		this.app.use( session( { secret: secret } ) );
	}

	public setUpAuth( app: express.Express, db: {}, GOOGLE_DATA: Google.IOAuth2StrategyOption, scope: string[] )
	{
		passport.serializeUser( ( user, done ) =>{ done( null, this.remakeUser( <Google.Profile>user ) ); } );

		passport.deserializeUser( (obj, done) => { done( null, obj ); } );

		passport.use( new Google.OAuth2Strategy( GOOGLE_DATA, ( accessToken: string, refreshToken: string, profile: Google.Profile, done: any ) =>
		{
			(<any>profile).token = accessToken;
			(<any>profile).token_secret = refreshToken;
			return done( null, profile );
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

	private getSessionData( req: express.Request ): SessionData{ if ( !(<any>req.session).passport || !(<any>req.session).passport.user ){ return {id:'',name:'',email:'',image:'',type:0}; } return (<SessionData>(<any>req.session).passport.user); }

	private remakeUser( profile: Google.Profile, type?: number )
	{
		const user: SessionData =
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


export = Auth;
