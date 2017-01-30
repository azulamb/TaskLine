import Auth = require( './Auth' );

class DB implements Auth.DB
{
	public getUser( email:string ): Promise<{}>
	{
		return Promise.resolve( {} );
	}

	public canAddUser( email:string ): Promise<boolean>
	{
		return Promise.resolve( true );
	}

	public addUser( data: Auth.UserData ): Promise<{}>
	{
		return Promise.resolve( {} );
	}
}

export = DB;