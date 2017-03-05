function initMap() {
  ko.applyBindings(new ViewModel());
}

var defaultPlaces = [
  {
    business : 'Wexford Inn',
    type : 'eat'
  },
  {
    business : 'Kenko Sushi',
    type : 'eat'
  },
  {
    business : 'Shoprite',
    type : 'shop'
  },
  {
    business : 'Mcdonalds',
    type : 'eat'
  },
  {
    business : 'Walgreens',
    type : 'shop'
  },
  {
    business : 'Siboras',
    type : 'eat'
  },
  {
    business : 'wolfsons market',
    type : 'shop'
  },
  {
    business : 'sunset pub',
    type : 'eat'
  },
  {
    business : 'ace hardware',
    type : 'shop'
  },
  {
    business : 'anthony francos',
    type : 'eat'
  }
];

var Place = function (data, map, placeInfo, marker){
  this.num = data.num;
  this.business = ko.observable(placeInfo.business);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.address = ko.observable(data.address);
  this.type = ko.observable(data.type);;
  this.map = map;
  this.marker = marker;
  this.isClick = ko.observable(false);
  this.show = ko.observable(true);

}

var ViewModel = function() {

  //initialize map
  var uluru = {lat: 40.92362, lng: -74.3033016};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: uluru,
  });


  var self = this;


  self.showType = ko.observable('all');
  self.showType.subscribe(function(nValue){
    self.filter(nValue);
  })
  self.places = ko.observableArray();
  self.markers = ko.observableArray();
  self.infoWindow = ko.observableArray();
  self.visiblePlaces = ko.computed(function(){
    return this.places().filter(function(place){
      if(place.show())
        return place;
    });
  }, self);
  self.types = ['all','eat','shop'];

  var i = 0;
  var marker = [];


  defaultPlaces.forEach(function(placeInfo){
    var url = "https://maps.googleapis.com/maps/api/geocode/json?&address="+placeInfo.business+" lincoln park nj";
    var json = $.getJSON(url, function(data) {

      var data = {
        num : i++,
        lat : data.results[0].geometry.location.lat,
        lng : data.results[0].geometry.location.lng,
        address : data.results[0].formatted_address,
        business : placeInfo.business,
        type : placeInfo.type
      }

      console.log(data.type);

      self.addInfoWindow(data.business, data.num);
      type = data.type[0];

      var marker = new google.maps.Marker({
        position: {lat: data.lat, lng:data.lng},
        map: map
      });

      var place = new Place(data, map, placeInfo, marker);

      marker.addListener('click', function (){
        self.placeClicked(place);
      });

      self.markers.push(marker);

      //console.log('adding place:' + placeInfo.business + ' as marker ' + self.markers().length + data.num);
      self.places.push(place);

    });
  });

  self.addInfoWindow = function (business, num){

    var fourJson = $.getJSON('https://api.foursquare.com/v2/venues/search',
    {
      client_id : 'SNGRM4BA4YDPN4YDDKOJPR0VKDMZFCMFXBXBSO5SETZ3FY4Y',
      client_secret : '1GC0EFMZ2VDWTVU2GIFGF1VN3E4XF2ESLRW3DSCX5IIPFQMG',
      v : '20170304',
      near : 'lincoln park, nj',
      query : business
    },
     function(data){

       var content = {
         name : data.response.venues[0].name,
         url : data.response.venues[0].url,
         phone : data.response.venues[0].contact.formattedPhone,
         checkIns : data.response.venues[0].stats.checkinsCount
       }

      displayContent = "<center><b>"+content.name+"</b></center>";
      if(content.url)
        displayContent += "<a href='"+content.url+"'>"+content.url+"</a><br>";
      else {
        displayContent += "No Website Available<br>"
      }
      displayContent += "Phone: " + content.phone +"<br>";
      displayContent += "Check-Ins: " + content.checkIns;

       self.infoWindow()[num] = new google.maps.InfoWindow({
         content: displayContent
       });
    });
  }

  self.filter = function (type){
    for(i=0; i < self.places().length; i++) {
      if ((self.places()[i].type() == type) || (type == 'all')){
        self.places()[i].show(true);
        self.markers()[i].setVisible(true);
      }
      else{
        self.places()[i].show(false);
        self.markers()[i].setVisible(false);
      }
    }


  }


  self.placeClicked = function (places){

    for(i=0; i < self.places().length; i++) {
      self.infoWindow()[i].close();
      self.markers()[i].setAnimation(null);
    }

    self.infoWindow()[places.num].open(places.map, places.marker);

    self.markers()[places.num].setAnimation(google.maps.Animation.BOUNCE);

  }
}
