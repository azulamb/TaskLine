

class API
{
	public static userInfo( success: ( data: any ) => void, failure: ( data: any ) => void )
	{
		lfetch.get( '/api/user', success, failure );
	}

	public static getTask( success: ( data: T_TaskData ) => void, failure: ( data: any ) => void )
	{
		lfetch.get( '/api/task/list', success, failure );
	}
}
