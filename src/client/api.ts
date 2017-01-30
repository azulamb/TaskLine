class API
{
	public static userInfo( success: ( data: any ) => void, failure: ( data: any ) => void )
	{
		lfetch.get( '/api/user', success, failure );
	}

}
