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
		tl.addTask( new TaskData( '1', 'test', 7 ) );
		tl.addTask( new TaskData( '1', 'test2', 7 ) );
		tl.addTask( new TaskData( '1', 'test3', 7 ) );
		tl.addTask( new TaskData( '1', 'test4', 7 ) );

		tl.render();

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
	}
}
