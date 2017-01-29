const TWIDTH = 1.5;

function createElement( data: { tag: string, idbase?: string, contents?: string, class?: string, draggable?: boolean } ): HTMLElement
{
	const e = document.createElement( data.tag );
	if ( data.idbase ) { e.id = data.idbase + this.id; }
	if ( data.contents !== undefined ) { e.innerHTML = data.contents; }
	if ( data.class !== undefined ) { e.classList.add( data.class ); }
	if ( data.draggable ) { e.draggable = true; }
	return e;
}

class DragElement
{
	private x: number;
	private y: number;
	private _begin: ( e: DragEvent, d: DragElement ) => void | undefined;
	private _move: ( x: number, y: number, e: DragEvent, d: DragElement ) => void;
	private variation: number;
	private vx: number;
	private vy: number;

	constructor( grabElement: HTMLElement, move: ( x: number, y: number, e: DragEvent, d: DragElement ) => void, begin?: ( e: DragEvent, d: DragElement ) => void )
	{
		this.setVariation( 1 );
		this._move = move;
		this._begin = <any>begin;
		grabElement.addEventListener( 'dragstart', ( e ) => { this.begin( e ); }, false );
		grabElement.addEventListener( 'drag', ( e ) => { this.drag( e ); }, false );
		grabElement.addEventListener( 'dragend', ( e ) => { this.end( e ); }, false );
	}

	public setVariation( variation: number ) { this.variation = variation; }

	public getVariation() { return this.variation; }

	private begin( e: DragEvent )
	{
		this.x = this.vx = e.x;
		this.y = this.vy = e.y;
		if ( this._begin ){ this._begin( e, this ); }
	}

	private drag( e: DragEvent )
	{
		if ( e.x === 0 && e.y === 0 ) { return; }
		if ( Math.abs( this.vx - e.x ) < this.variation && Math.abs( this.vy - e.y ) < this.variation ) { return; }
		this.vx = e.x;
		this.vy = e.y;
		this._move( e.x - this.x, e.y - this.y, e, this );
	}

	private end( e: DragEvent )
	{
		this._move( e.x - this.x, e.y - this.y, e, this );
	}
}

class TaskHeader
{
	private parent: TaskData;
	private name: string;
	private header: HTMLElement;
	private h: HTMLInputElement;
	constructor( parent: TaskData, name: string )
	{
		this.parent = parent;

		this.header = <HTMLHeadingElement>createElement( { tag: 'h3' } );
		this.h = <HTMLInputElement>createElement( { tag: 'input', idbase: 'h', draggable: true } );
		this.h.addEventListener( 'dblclick', () => { this.h.readOnly = false; this.h.draggable = false; }, false );
		this.setName( name );
		this.h.readOnly = true;
		new DragElement( this.h, ( x: number, y: number, e: DragEvent, d: DragElement ) => { this.move( x, e, d ); }, ( e: DragEvent, d: DragElement ) => { this.setVariation( d ); } );

		const toggle = createElement( { tag: 'span', class: 'toggleOpen' } );
		toggle.addEventListener( 'click', () => { parent.getElement().classList.toggle( 'open' ); }, false );

		const grip = createElement( { tag: 'span', draggable: true, class: 'grip' } );
		new DragElement( grip, ( x: number, y: number, e: DragEvent, d: DragElement ) => { this.resize( x, e, d ); }, ( e: DragEvent, d: DragElement ) => { this.setVariation( d ); } );

		this.header.appendChild( this.h );
		this.header.appendChild( toggle );
		this.header.appendChild( grip );
	}

	public setName( name?: string )
	{
		if ( name !== undefined ) { this.name = name; }
		this.h.value = this.name;
	}

	private setVariation( d: DragElement )
	{
		d.setVariation( parseInt( document.documentElement.style.fontSize || '10' ) * TWIDTH );
	}

	private move( x: number, e: DragEvent, d: DragElement )
	{
		if (! this.h.readOnly ){ return; }
		const size = d.getVariation();
		if ( e.type === 'dragend' )
		{
			this.parent.move( this.parent.getBegin() + Math.floor( x / size ), true );
		} else //if ( 1 < Math.abs( x / size /*- this.parent.getBegin()*/ ) )
		{
			this.parent.move( this.parent.getBegin() + Math.floor( x / size ) );
		}
	}

	private resize( x: number, e: DragEvent, d: DragElement )
	{
		if (! this.h.readOnly ){ return; }
		const size = d.getVariation();
		if ( e.type === 'dragend' )
		{
			this.parent.setWidth( this.parent.getLength() + Math.floor( x / size ), true );
		} else if ( 1 < this.parent.getLength() + Math.abs( x / size ) )
		{
			this.parent.setWidth( this.parent.getLength() + Math.floor( x / size ) );
		}
	}

	public getElement() { return this.header; }
}

class TaskData
{
	private id: string;
	private begin: number;
	private days: number;

	private m: HTMLDivElement;
	private h: TaskHeader;

	constructor( id: string, name: string, days: number )
	{
		this.id = id;

		this.m = <HTMLDivElement>createElement( { tag: 'div', idbase: 't' } );
		this.m.dataset[ 'id' ] = this.id;
		this.move( 0, true );
		this.setWidth( days, true );

		this.h = new TaskHeader( this, name );

		this.m.appendChild( this.h.getElement() );
	}


	public getID() { return this.id; }

	public setName( name?: string ) { this.h.setName( name ); }

	public setWidth( days: number, update: boolean = false )
	{
		if ( update ) { this.days = days; }

		this.m.style.width = ( days * TWIDTH ) + 'rem';
	}

	public move( days: number, update: boolean = false )
	{
		if ( update ) { this.begin = days; }

		this.m.style.marginLeft = ( days * TWIDTH ) + 'rem';
	}

	public render(): HTMLElement
	{
		return this.m;
	}

	public getElement() { return this.m; }

	public getBegin() { return this.begin; }

	public getLength() { return this.days; }
}

class TaskLine
{
	private begin: Date;
	private end: Date;
	private tasks: TaskData[];

	constructor( begin?: Date, end?: Date )
	{
		this.tasks = [];
		this.begin = begin || new Date( new Date().getTime() - 2 * 24 * 60 * 60 * 1000 );
		this.end = end || new Date( this.begin.getTime() + 31 * 24 * 60 * 60 * 1000 );
	}

	private _setDate( e: HTMLLIElement, value: string, length: number = 0 )
	{
		e.innerHTML = value;
		if ( length <= 0 ) { return; }
		e.style.width = ( length * TWIDTH ) + 'rem';
	}

	private setDate( id: string, list: string[] | { label: string, length: number }[] )
	{
		const e = <HTMLUListElement>document.getElementById( id );
		if ( !e ) { return; }
		while ( e.children.length <= list.length ) { e.appendChild( document.createElement( 'li' ) ); }
		while ( list.length < e.children.length ) { e.removeChild( e.children[ list.length ] ); }
		for ( let i = 0 ; i < e.children.length ; ++i )
		{
			if ( typeof list[ i ] === 'string' )
			{
				this._setDate( <HTMLLIElement>e.children[ i ], <string>list[ i ] );
			} else
			{
				this._setDate( <HTMLLIElement>e.children[ i ], (<{ label: string }>list[ i ]).label, (<{ length: number }>list[ i ]).length );
			}
		}
	}

	public addTask( data: TaskData | TaskData[] )
	{
		if ( data instanceof Array )
		{
			this.tasks.push( ...data );
		} else
		{
			this.tasks.push( data );
		}
	}

	private renderDate()
	{
		const date: Date = new Date( this.begin.getTime() );
		let m = this.begin.getMonth();
		const mlist: { label: string, length: number }[] = [ { label: ( m + 1 ) + '', length: 1 } ];
		const dlist: string[] = [ this.begin.getDate() + '' ];

		while ( date.getTime() <= this.end.getTime() )
		{
			date.setDate( date.getDate() + 1 );
			if ( m !== date.getMonth() )
			{
				m = date.getMonth();
				mlist.push( { label: ( m + 1 ) + '', length: 1 } );
			} else
			{
				++mlist[ mlist.length - 1 ].length;
			}
			dlist.push( date.getDate() + '' );
		}

		const e = document.getElementById( 'date' );
		if ( !e ) { return; }
		e.style.width = ( dlist.length * TWIDTH ) + 'rem';
		this.setDate( 'month', mlist );
		this.setDate( 'day', dlist );
	}

	private renderTasks()
	{
		const e = document.getElementById( 'tasks' );
		if ( !e ) { return; }
		this.tasks.forEach( ( task ) =>
		{
			e.appendChild( task.render() );
		} );
	}

	public render( updateDate: boolean = true )
	{
		if ( updateDate ) { this.renderDate(); }
		this.renderTasks();
	}
}
