/**
* A polyline with enableDrawing, enableEditing, and disableEditing.
*
* @class google.mapsextensions.Polyline
* @extends google.maps.Polyline
* @constructor
*/
google.mapsextensions.Polyline = function() {
	google.maps.Polyline.apply( this, arguments );

	this.initPathWithMarkers();
};
google.mapsextensions.Polyline.prototype = new google.maps.Polyline();

extend( google.mapsextensions.Polyline.prototype, {
	enableDrawing: function( opts ) {
		// maxVertices, fromStart
		opts = opts || {},
		opts.fromStart = opts.fromStart || false;
		opts.maxVerticies = 'number' == typeof ( opts.maxVertices ) ? opts.maxVerticies : Infinity;
		this.drawingOpts = opts;
		
		this.mapClickHandler = google.maps.event.addListener( this.getMap(), 'click', bind( this.onMapClick, this ) );
	},
	
	enableEditing: function( opts ) {
		this.pathWithMarkers.setEditable( true );
		this.setPolylineEditable( true );
		
		this.polylineMouseDownHandler = google.maps.event.addListener( this, 'mousedown', bind( this.onPolylineMouseDown, this ) );
	},

	disableEditing: function( opts ) {
		this.editingEnabled = false;
		this.pathWithMarkers.setEditable( false );
		this.setPolylineEditable( false );
		
		if( this.polylineMouseDownHandler ) {
			google.maps.event.removeListener( this.polylineMouseDownHandler );
			this.polylineMouseDownHandler = null;
		}
		
		if( this.mapClickHandler ) {
			google.maps.event.removeListener( this.mapClickHandler );
			this.mapClickHandler = null;
		}
		
	},

	onPolylineMouseDown: function( event ) {
		var latLng = event.latLng;
		var segment = this.pathWithMarkers.getIndexOfSegmentContainingPoint( latLng );
		if( segment > -1 ) {
			var index = segment + 1;	// if we are adding to segment 0, then the added point is point 1.
			this.addPoint( latLng, index );
			this.addPointFromPolyline = true;
		}
	},
	
	onMapClick: function( event ) {
		if( !this.addPointFromPolyline ) {
			var path = this.getPath();
			var index = this.drawingOpts.fromStart ? 0 : path.length;
			this.addPoint( event.latLng, index );
		}
		
		this.addPointFromPolyline = false;
	},
	
	onLineUpdated: function( event ) {
		google.maps.event.trigger( this, 'lineupdated' );
	},
	
	addPoint: function( latLng, index ) {
		var path = this.getPath();
		if( path.length < this.drawingOpts.maxVerticies ) {
			this.pathWithMarkers.insertAt( index, latLng );
		}
	},

	initPathWithMarkers: function() {
		this.pathWithMarkers = new google.mapsextensions.PathWithMarkers( {
			path: this.getPath(),
			map: this.getMap()
		} );
		google.maps.event.addListener( this.pathWithMarkers, 'lineupdated', bind( this.onLineUpdated, this ) );
	},
	
	setPolylineEditable: function( editable ) {
		this.setOptions( { 
			clickable: editable
		} );
	},
	
	setMap: function( map ) {
		this.pathWithMarkers.setMap( map );
		
		google.maps.Polyline.prototype.setMap.apply( this, arguments );
	}

} );

