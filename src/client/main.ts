module App
{
	function hidden( id: string, hide: boolean )
	{
		const e = document.getElementById( id );
		if ( !e ) { return false; }
		e.classList[ hide ? 'add' : 'remove' ]( 'hidden' );
		return true;
	}

	function setContents( id: string, content: string )
	{
		const e = document.getElementById( id );
		if ( !e ) { return; }
		e.innerHTML = content;
	}

	function error( title: string = '', message: string = '' )
	{
		if ( !title && !message ) { hidden( 'error', false ); return; }
		hidden( 'error', true );
		setContents( 'emessage', message || '' );
	}

	function afterLogin( data: any )
	{
		console.log( data );
		window.history.replaceState( null, '', '/' );

		hidden( 'main', false );
		hidden( 'login', true );

		const tl = new TaskLine();

		API.getTask( ( data ) =>
		{
console.log(data);
			tl.parseData( data );
			tl.render();
		}, () => { error( 'Network error', 'Please reload this page.' ); } );
	}

	export function init()
	{
		API.userInfo( afterLogin, ( data: any ) =>
		{
			const message = data.message || 'Unknown error.';
			//error( 'Error', message );
		} );

		const menu = document.getElementById( 'togglemenu' );
		if ( !menu ) { return; }
		menu.addEventListener( 'click', () =>
		{
			const e = menu.parentElement;
			if ( !e ) { return; }
			e.classList.toggle( 'open' );
		}, false );
	}
}
