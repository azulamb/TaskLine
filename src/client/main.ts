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

/*tl.addTask( new TaskData( tl, '1', 'test', 7 ) );
tl.addTask( new TaskData( tl, '2', 'test2', 7 ) );
tl.addTask( new TaskData( tl, '3', 'test3', 7 ) );
tl.addTask( new TaskData( tl, '4', 'test4', 7 ) );*/

			tl.render();
		}, () => { error( 'Network error', 'Please reload this page.' ); } );

		/*setTimeout(()=>{
			const article = document.getElementsByTagName( 'article' );
			if ( !article ) { return; }
			article[ 0 ].scrollTo( 2 * 1.5 * parseInt( document.documentElement.style.fontSize || '10' ), 0 ) ;
		},1000);*/
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
