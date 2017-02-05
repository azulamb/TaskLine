const TWIDTH = 1.5;
const DFAULT_DAYS = 60;

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

class TaskElement
{
	protected element: HTMLElement;

	public initElement( tag: string, idbase: string = '' )
	{
		this.element = createElement( { tag: tag, idbase: idbase } );
	}

	public getElement() { return this.element; }
}

class TaskHeader extends TaskElement
{
	private parent: TaskData;
	private name: string;
	private h: HTMLInputElement;

	constructor( parent: TaskData, name: string )
	{
		super();
		this.initElement( 'h3' );
		this.parent = parent;

		this.h = <HTMLInputElement>createElement( { tag: 'input', idbase: 'h', draggable: true } );
		this.h.addEventListener( 'dblclick', () => { this.h.readOnly = false; this.h.draggable = false; }, false );
		this.setName( name );
		this.h.readOnly = true;
		new DragElement( this.h, ( x: number, y: number, e: DragEvent, d: DragElement ) => { this.move( x, e, d ); }, ( e: DragEvent, d: DragElement ) => { this.setVariation( d ); } );

		const toggle = createElement( { tag: 'span', class: 'toggleOpen' } );
		toggle.addEventListener( 'click', () =>
		{
			parent.getElement().classList.toggle( 'open' );
			parent.updateHeight();
		}, false );

		const grip = createElement( { tag: 'span', draggable: true, class: 'grip' } );
		new DragElement( grip, ( x: number, y: number, e: DragEvent, d: DragElement ) => { this.resize( x, e, d ); }, ( e: DragEvent, d: DragElement ) => { this.setVariation( d ); } );

		this.element.appendChild( this.h );
		this.element.appendChild( toggle );
		this.element.appendChild( grip );
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
			const days = this.parent.getLength() + Math.floor( x / size );
			this.parent.setWidth( days < 2 ? 2 : days, true );
		} else if ( 1 < this.parent.getLength() + Math.floor( x / size ) )
		{
			this.parent.setWidth( this.parent.getLength() + Math.floor( x / size ) );
		}
	}
}

class TaskFooter extends TaskElement
{
	constructor()
	{
		super();
		this.initElement( 'div' );
	}
}

class TaskWorker extends TaskElement
{
	private cls: string;
	constructor( worker: T_Worker )
	{
		super();
		this.cls = 'wc' + worker.id;
		this.initElement( 'ul' );
		this.element.appendChild( createElement( { tag: 'li', contents: worker.name } ) );
	}

	public setLength( days: number, update: boolean = false )
	{
		while ( this.element.children.length <= days )
		{
			const e = createElement( { tag: 'li' } );
			e.addEventListener( 'click', () =>
			{
				e.classList.toggle( this.cls );
			}, false );
			this.element.appendChild( e );
		}
	}
}

class TaskWorkers extends TaskElement
{
	private workers: TaskWorker[];

	constructor()
	{
		super();
		this.initElement( 'div' );
		this.workers = [];
	}

	public add( worker: TaskWorker )
	{
		this.workers.push( worker );
		this.element.appendChild( worker.getElement() );
	}

	public setLength( days: number, update: boolean = false )
	{
		this.workers.forEach( ( w ) => { w.setLength( days, update ); } );
	}
}

class TaskData extends TaskElement
{
	private data: T_Task;
	private begin: number;
	private days: number;

	private header: TaskHeader;
	private workers: TaskWorkers;
	private footer: TaskFooter;

	constructor( parent: TaskLine, data: T_Task )
	{
		super();
		this.initElement( 'div', 't' );
		this.data = data;

		this.element.dataset[ 'id' ] = data.id;
		this.move( 0, true );

		this.header = new TaskHeader( this, data.name );

		this.workers = new TaskWorkers();

		this.footer = new TaskFooter();

		parent.getWorker().forEach( ( item ) =>
		{
			this.workers.add( new TaskWorker( item ) );
		} );

		this.element.appendChild( this.header.getElement() );
		this.element.appendChild( this.workers.getElement() );
		this.element.appendChild( this.footer.getElement() );

		const begin = new Date( data.begin );
		const end = new Date( data.end );

		this.move( this.calcDays( begin, parent.getBegin() ), true );
		this.setWidth( this.calcDays( end, begin ), true );
	}

	private calcDays( date: Date, older: Date ): number
	{
		return Math.floor( ( date.getTime() - older.getTime() ) / ( 24 * 60 * 60 * 1000 ) );
	}

	public getID() { return this.data.id; }

	public setName( name?: string ) { this.header.setName( name ); }

	public setWidth( days: number, update: boolean = false )
	{
		if ( update ) { this.days = days; }

		this.element.style.width = ( days * TWIDTH ) + 'rem';

		this.workers.setLength( days, update );
	}

	public move( days: number, update: boolean = false )
	{
		if ( update ) { this.begin = days; }

		this.element.style.marginLeft = ( days * TWIDTH ) + 'rem';
	}

	public render(): HTMLElement
	{
		return this.element;
	}

	public getBegin() { return this.begin; }

	public getLength() { return this.days; }

	public updateHeight()
	{
		const t = document.getElementById( 'tasks' );
		const d = document.getElementById( 'day' );
		const v = parseInt( document.documentElement.style.fontSize || '10' ) * 2;
		if ( !( t && d ) || t.clientHeight + v < d.clientHeight ) { return; }
		d.style.height = ( t.clientHeight + v ) + 'px';
	}
}

class TaskLine
{
	private begin: Date;
	private end: Date;
	private tasks: TaskData[];

	private worker: T_Worker[];

	private css: TaskLineStyle;

	constructor( begin?: Date, end?: Date )
	{
		this.tasks = [];
		this.begin = begin || new Date( new Date().getTime() - 2 * 24 * 60 * 60 * 1000 );
		this.end = end || new Date( this.begin.getTime() + DFAULT_DAYS * 24 * 60 * 60 * 1000 );

		this.css = new TaskLineStyle();
	}

	private _setDate( e: HTMLLIElement, value: string, week: number = -1, length: number = 0, holiday: boolean = false, today: boolean = false )
	{
		e.innerHTML = value;
		if ( 0 <= week ) { e.classList.add( 'week' + week ); }
		if ( holiday ){ e.classList.add( 'holiday' ); }
		if ( today ){ e.classList.add( 'today' ); }
		if ( length <= 0 ) { return; }
		e.style.width = ( length * TWIDTH ) + 'rem';
	}

	private setDate( id: string, list: { label: string, week?: number, length?: number, holiday?: boolean, today?: boolean }[] )
	{
		const e = <HTMLUListElement>document.getElementById( id );
		if ( !e ) { return; }
		while ( e.children.length <= list.length ) { e.appendChild( document.createElement( 'li' ) ); }
		while ( list.length < e.children.length ) { e.removeChild( e.children[ list.length ] ); }
		for ( let i = 0 ; i < e.children.length ; ++i )
		{
			this._setDate( <HTMLLIElement>e.children[ i ], list[ i ].label, list[ i ].week, list[ i ].length, list[ i ].holiday, list[ i ].today );
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

	private isToday( date: Date, now: Date ) { return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate(); }

	private renderDate()
	{
		const now = new Date();
		const date: Date = new Date( this.begin.getTime() );
		let m = this.begin.getMonth();
		const mlist: { label: string, length: number }[] = [ { label: ( m + 1 ) + '', length: 1 } ];
		const dlist: { label: string, week: number, holiday: boolean, today: boolean }[] = [ { label: this.begin.getDate() + '', week:this.begin.getDay(), holiday: false, today: this.isToday( this.begin, now ) } ];

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

			dlist.push( { label: date.getDate() + '', week: date.getDay(), holiday: false, today: this.isToday( date, now ) } );
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

	public setColor( item: T_Worker )
	{
		this.css.addColor( 'wc' + item.id, item.color );
	}

	public parseData( data: T_TaskData )
	{
		this.worker = data.worker;
		data.worker.forEach( ( item ) => { this.setColor( item ); } );

		data.task.forEach( ( item ) => { this.addTask( new TaskData( this, item ) ); } );
	}

	public getWorker(): T_Worker[] { return this.worker; }

	public getBegin() { return this.begin; }
	public getEnd() { return this.end; }
}
