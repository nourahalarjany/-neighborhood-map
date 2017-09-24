var Model = {
	selectedMaker: ko.observable(null),
	locations: [
	{
		position: {
			lat: 24.7679566,
			lng: 46.7179224
		},
		address: 'Riyadh',
		name: 'Nakheel mall',
		id: "a47071498e183ecb19e0cf"
	},
	{

		position: {
			lat:24.6928262, 
			lng:46.6721025
		},
		address: 'Riyadh',
		name: 'Panorama mall',
		id: "bb60acd46d4a5932198c5c0"
	},

	{
		position: {
			lat:24.697506, 
			lng:46.6861512
		},
		address: 'Riyadh',
		name: 'Centria mall',
		id: "bc6d588f360ef3b943fdc2d"
	},

	{
		position: {
			lat:24.6664142, 
			lng:46.6898051
		},
		address: 'Riyadh',
		name: 'Njod mall',
		id: "e4bd6d618a808fd11027798"
	},

	{
		position: {
			lat:24.7113143, 
			lng:46.6766355
		},
		address: 'Riyadh',
		name: 'Kingdom centr',
		id: "b08d04e4b045752b6cda32"
	}
	]
};
var MapViewModel = function() {
	 //Use the keyword 'this' to bind the observableArray to the ViewMode
	var self = this;
	 //In order to implment the list view using knockout we are Coping the values of Locations and stores them in an observable array.
	 // in ither word : Initialize the observableArray with the locations Array
	self.locations = ko.observableArray();
	self.searchQ = ko.observable('');
	self.filteredLocations = ko.computed(function() {
        return ko.utils.arrayFilter(self.locations(), function(marker) {
            return marker.title.toLowerCase().indexOf(self.searchQ().toLowerCase()) !== -1;
        });
    }, self);
    self.filteredLocations.subscribe(function() {
    	var diffArray = ko.utils.compareArrays(self.locations(), self.filteredLocations());
    	ko.utils.arrayForEach(diffArray, function(marker) {
    		marker.status == 'deleted' ? marker.value.setMap(null) : marker.value.setMap(self.map);
    	});
	});

	self.pickLocation = function(loc) {
        google.maps.event.trigger(loc, 'click');
    };
};

var instance = new MapViewModel();

var initMarkers = function(markers, map) {
	markers.forEach(function(marker){
		var pos = marker.position;
		var markerPos = new google.maps.LatLng(pos.lat, pos.lng);
		var marker = new google.maps.Marker({
			position: markerPos,
			map: map,
			title: marker.name
		});
		google.maps.event.addListener(marker, 'click', onMarkerClick);
		 //This way will helps in pushing the markers in the array.
		instance.locations.push(marker);
	});
};


var onMarkerClick = function() {
	var self = this;
	 // the unique foursquare api 
	var fourSquareApi = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat() + ',' + this.position.lng();
	fourSquareApi += '&client_id=OV0ZUND2P3CMRZFLF10UVF3S4GGL4XLXEKHBFKMKQFEGMQMP&client_secret=15KNS3XRLU4HUCWU2ZU5I1MGTJIG50VWJHECLDTDLONAG55M&v=20170601&query=';
	fourSquareApi += this.title;

	 //infowindows to each Location 
	var infoWindow = instance.tempInfoWindow;


	 // ajax get venue name, phone number, twitter and the locations website
	$.getJSON(fourSquareApi).done(function(data) {
		var responseApi = data.response.venues[0];
		console.log(data.response);
		self.phone   = responseApi.contact.formattedPhone || "Sorry, there is no contact info!";
		self.twitter = responseApi.contact.twitter ? "@" + responseApi.contact.twitter  : "Sorry, there is no twitter account";
		self.url     = responseApi.url || "Sorry, there is no website url";
		 // infowindow to display the content when the marker is clicked.and populate the content based
         // on that markers position.
		infoWindow.setContent('<div><br>' + self.title + '<hr /> <br>Phone : ' + self.phone +'<br>twitter : ' +self.twitter +'<br> Website : ' +self.url +'<br></div>');
		infoWindow.open(instance.map, self);
		instance.map.panTo(self.position);
		 // Animatting the markers when it's clicked.
		self.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){
			 //The markers is bouncing.
			self.setAnimation(null);
		}, 1420);
		 // window alert will be activaded to notify the user of the failed in contact with foursquare Api
	}).fail(function(){  
		window.alert(" failed to contact with foursquare Api ");
	});

};
 // initiate the map on screen
var initMap = function() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 24.7064333, lng: 46.8098004},
 		zoom: 11
	});
    instance.tempInfoWindow = new google.maps.InfoWindow({content: null});
	instance.map = map;
	initMarkers(Model.locations, map);
	ko.applyBindings(instance);
};

var googleError = function(){
	window.alert("Google map dosen't load, something went wrong!");
};

