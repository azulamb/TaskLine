module lfetch
{

	function createRequest( success?: ( data: {}, req?: XMLHttpRequest ) => void, failure?: ( data: {}, req?: XMLHttpRequest ) => void )
	{
		loading( false );
		try
		{
			const req = new XMLHttpRequest();
			req.onreadystatechange = changeState( req, success, failure );
			return req;
		} catch( e ){}
		return null;
	}

	function changeState( req: XMLHttpRequest, success?: ( data: {}, req?: XMLHttpRequest ) => void, failure?: ( data: {}, req?: XMLHttpRequest ) => void )
	{
		return () =>
		{
			if ( req.readyState !== 4 ) { return; }

			// Connect failure.
			if ( req.status == 0) { if ( failure ){ failure( {}, req ); } return; }

			if( ( 200 <= req.status && req.status < 300 ) || ( req.status == 304 ) )
			{
				// Success.
				if ( success )
				{
					try
					{
						const data = JSON.parse( req.responseText );
						success( data, req );
					}catch( e ) { if ( failure ){ failure( {}, req ); } }
				}
			} else
			{
				// Error.
				if ( failure )
				{
					try
					{
						const data = JSON.parse( req.responseText );
						failure( data, req );
					}catch( e ) { if ( failure ){ failure( {}, req ); } }
				}
			}
		};
	}

	export function loading( begin: boolean )
	{
		const e = document.getElementById( 'loading' );
		if ( !e ) { return; }
		e.classList[ begin ? 'remove' : 'add' ]( 'hidden' );
	}

	export function get( url: string, success?: ( data: {}, req?: XMLHttpRequest ) => void, failure?: ( data: {}, req?: XMLHttpRequest ) => void )
	{
		loading( true );
		const req = createRequest( success, failure );
		if ( !req ) { return false; }
		req.open( 'GET', url );
		req.send( null );
	}

	export function post( url: string, data: {}, success?: ( data: {}, req?: XMLHttpRequest ) => void, failure?: ( data: {}, req?: XMLHttpRequest ) => void | undefined )
	{
		loading( true );
		const req = createRequest( success, failure );
		if ( !req ) { return false; }
		req.open( 'POST', url );
		req.send( JSON.stringify( data ) );
	}
}