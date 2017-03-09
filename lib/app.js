//Call back from good gmaps
function initMap() {
  $(document).ready(function() {
    var $toggleButton = $('.toggle-button'),
        $menuWrap = $('.menu-wrap');

    $toggleButton.on('click', function() {
        $(this).toggleClass('button-open');
        $menuWrap.toggleClass('menu-show');
    });
  });

  ko.applyBindings(new ViewModel());
}

//Google maps loading error
function googleError() {
  self.error = "error";
  console.log('Error loading google maps.')
}

//Set the names and types of places to load
//Formating does not matter proper names will be pulled form FourSquare
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
  //We keep this as an observable to update the name formating from foursquare
  this.business =  ko.observable(placeInfo.business);
  this.lat = data.lat;
  this.lng = data.lng;
  this.address =data.address;
  this.type =data.type;;
  this.map = map;
  this.marker = marker;
  this.isClick = ko.observable(false);
  this.show = ko.observable(true);

}

var uluru;

var map;

var ViewModel = function() {

  uluru = {lat: 40.92362, lng: -74.3033016};

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: uluru,
    disableDefaultUI: true
  });

  var self = this;

  //Allow users to select the type of places to show
  self.showType = ko.observable('all');
  self.showType.subscribe(function(nValue){
    self.filter(nValue);
  });

  self.error =  ko.observable();
  self.places = ko.observableArray();
  self.markers = ko.observableArray();
  self.infoWindow = new google.maps.InfoWindow({});
  self.infoWindows = [];

  //Keep track of what places should be shown.
  self.visiblePlaces = ko.computed(function(){
    return this.places().filter(function(place){
      if(place.show())
        return place;
    });
  }, self);

  //Add or remove more types of places as options.
  self.types = ['all','eat','shop'];

  var i = 0;
  var marker = [];

  //Load info to create marker.
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
      self.places.push(place);

    }).fail(function(){
      var error = 'Error grabbing info from Google';
      self.error('error');
      console.log(error);
    });;
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

       self.infoWindows[num] = displayContent;
       //Update names formating here.
       self.places()[num].business(content.name);
    }).fail(function(){
      var error = 'Error getting info from FourSquare';
      self.error('Error');
      console.log(error);
    });
  }

  //Filter simply checks all places and toggles to show or not depending on type
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
      self.markers()[i].setAnimation(null);
    }

    self.infoWindow.setContent(self.infoWindows[places.num]);
    self.infoWindow.open(places.map, places.marker);
    self.markers()[places.num].setAnimation(google.maps.Animation.BOUNCE);
  }
}
