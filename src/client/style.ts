class TaskLineStyle
{
	private css: CSSStyleSheet;
	constructor()
	{
		const newStyle = document.createElement('style');
		newStyle.type = "text/css";
		document.getElementsByTagName( 'head' ).item( 0 ).appendChild( newStyle );
		this.css = <CSSStyleSheet>document.styleSheets.item( 0 );
	}

	public addColor( name: string, color: string )
	{
		const idx = (<CSSRuleList>(<any>document.styleSheets[ 0 ]).cssRules).length;
		this.css.insertRule( '.' + name + '{background-color:' + color + ';}', idx);//末尾に追加
	}
}