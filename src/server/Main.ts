import express = require( 'express' );
import Auth = require( './Auth' );
import DB = require( './DB' );
import API = require( './API' );
import path = require( 'path' );
import fs = require( 'fs' );
import https = require( 'https' );

const PORT = process.env.PORT || 3080;
const GOOGLE_DATA =
{
	clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
	clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
	callbackURL: process.env.GOOGLE_CALLBACK || 'http://localhost:' + PORT + '/auth/google/callback',
};
const USER = process.env.USER || '';
const GOOGLE_SCOPE: string[] = process.env.GOOGLE_SCOPE ? process.env.GOOGLE_SCOPE.split( ',' ) : [ 'https://www.googleapis.com/auth/plus.login' ];
const PAGE_OPTION = { root: path.resolve( 'public' )/*, headers: { 'Content-Type': 'text/html' }*/ };

function PrivatePage( req: express.Request, res: express.Response, next: express.NextFunction )
{
	if ( !req.originalUrl.match( /\/[^\.]*$/ ) ){ return next(); }
	res.sendFile( 'index.html', PAGE_OPTION );
}

function ErrorPage( req: express.Request, res: express.Response, next: express.NextFunction )
{
	res.sendFile( 'notfound.html', PAGE_OPTION );
}

function Init(): Promise<{}>
{
	return Promise.resolve( {} );
}

function AppInit(): Promise<{ app: express.Express }>
{
	const app = express();
	const router = express.Router();
	const secret = process.env.SECRET_KEY || 'crocidolite';
	const auth = new Auth.AuthRoute( app, secret );
	const api = new API();
	const db = new DB();

	// public
	app.use( express.static( process.env.PUBLIC_DOCUMENT || './public' ) );
	if ( GOOGLE_SCOPE.indexOf( 'profile' ) < 0 ) { GOOGLE_SCOPE.push( 'profile' ); }
	if ( GOOGLE_SCOPE.indexOf( 'email' ) < 0 ) { GOOGLE_SCOPE.push( 'email' ); }

	// autn
	auth.setUpAuth( app, db, GOOGLE_DATA, GOOGLE_SCOPE );

	// api
	api.init( db );
	app.use( '/api', auth.auth( false ), api.getRouter() );

	return Promise.resolve( { app: app } );
}

function changeUser()
{
	if ( USER ) { process.setuid( USER ); }
}

Init().then( () =>
{
	// Log output start.
	const date = new Date();

	return AppInit().then( ( result ) =>
	{
		const app = result.app;
		if ( process.env.CERT_DIR )
		{
			const CERT_DIR = process.env.CERT_DIR;
			const option =
			{
				key: fs.readFileSync ( CERT_DIR + '/privkey.pem' ),
				cert: [ fs.readFileSync( CERT_DIR +  '/cert.pem' ) ],
				ca: [ fs.readFileSync( CERT_DIR +  '/chain.pem', 'utf8' ), fs.readFileSync( CERT_DIR +  '/fullchain.pem', 'utf8' ) ],
			};
			https.createServer( option, app ).listen( PORT, changeUser );
		} else
		{
			app.listen( PORT, changeUser );
		}
	} );
} ).catch( ( error ) =>
{
	console.log( error );
} );
