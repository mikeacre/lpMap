function initMap() {
  ko.applyBindings(new ViewModel());
}

var defaultPlaces = [
  {
    business : 'Wexfird Inn'
  },
  {
    business : 'Kenko Sushi'
  },
  {
    business : 'Shoprite'
  },
  {
    business : 'Mcdonalds'
  },
  {
    business : 'Wallgreens'
  },
  {
    business : 'Siboras'
  }
];

var Place = function (data, map, placeInfo){
  num = data.num;
  this.business = ko.observable(placeInfo.business);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.address = ko.observable(data.address);
  this.type = ko.observable(data.type);
  this.marker = new google.maps.Marker({
      position: {lat: data.lat, lng:data.lng},
      map: map,
      title: ""+data.num
    });


  this.marker.addListener('click', function(){
      console.log('Marker Click')
  });

}

var ViewModel = function() {

  var uluru = {lat: 40.92362, lng: -74.3033016};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: uluru,
  });

  var self = this;

  this.places = ko.observableArray([]);
  var i = 0;
  defaultPlaces.forEach(function(placeInfo){
    var url = "https://maps.googleapis.com/maps/api/geocode/json?&address="+placeInfo.business+" lincoln park nj";
    var json = $.getJSON(url, function(data) {
      var data = {
        num : i,
        lat : data.results[0].geometry.location.lat,
        lng : data.results[0].geometry.location.lng,
        address : data.results[0].formatted_address,
        type : data.results[0].type,
      }
      i++;
      self.places.push( new Place(data, map, placeInfo) );
    });
  });

  self.placeClicked = function(place) {
    console.log('button Click')
  };
}
