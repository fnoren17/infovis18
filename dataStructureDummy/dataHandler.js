// This function grabs a vessel's first appearence in the shipData-array list
// and uses correlated coordinates as final destination.
// (Assumption: that appearence is the ships last logged position, meaning it is it's destination.)
//
// Final outcome: vesselArray of [vesselId, lat, lng, total_co2] for unique vessels

var vesselArray = [];
function vesselDestination ()
{
  var newVessel, oldVessel;
  var marker;

  for (var i = 0; i < shipData.length; i++)
  {
    newVessel = shipData[i].vessel_id;
    if (i >= 1)
    {
      if (oldVessel == newVessel)
      {
        // Continue to look for change in newVessel-variable.
      }
      else
      {
        // We have a change in vessel-variable! Meaning that we can take that
        // first appearance of this new vessel as its destination
        var vessel = {"vesselId": shipData[i].vessel_id, "lat": shipData[i].latitude, "lng": shipData[i].longitude};
        vesselArray.push(vessel);
        dropMarker(shipData[i].latitude, shipData[i].longitude, shipData[i].vessel_id);
      }
    }
    else if (i == 0) // The first data point in the data file
    {
      var vessel = {"vesselId": shipData[i].vessel_id, "lat": shipData[i].latitude, "lng": shipData[i].longitude};
      vesselArray.push(vessel);
      dropMarker(shipData[i].latitude, shipData[i].longitude, shipData[i].vessel_id);
    }
    oldVessel = newVessel;
  }
  console.log("Below is array with vessels, coords, total_co2");
  console.log(vesselArray);

}

// Drops marker at given location
function dropMarker (lat, lng, vessel)
{
  marker = new google.maps.Marker({
    position: {"lat": lat, "lng": lng},
    map: map,
    label: " " +vessel +" ",
    draggable: false,
    animation: google.maps.Animation.DROP
  });
}



// From vesselArray, add country to the vessels based on their coordinates
var vesselCountryArray = [];
function constructVesselCountryArray ()
{
  for (var i = 0; i < vesselArray.length; i++)
  {
    // if (i == 0)
    // {
    //   console.log(vesselArray[0]);
    // }
    var vessel = vesselArray[i].vesselId;
    var lat = vesselArray[i].lat;
    var lng = vesselArray[i].lng;

    var urlPart = "lat=" +lat +"&lon=" +lng;
    var url = "https://nominatim.openstreetmap.org/reverse?format=json&" +urlPart +"&zoom=0&addressdetails=1";
    $.getJSON(url, function(json){
      var country = json.address.country;
      vesselCountryArray.push({"VesselID": vessel, "DestinationCountry": country}); // vesselID is wrong here, always the last in the list
                                                                  // call vesselIDReplacer after all getJSONs have been done to compensate
    });
  }
}

var x = 0;
var loopArray = function(arr) {
    customAlert(arr[x],function(){
        // set x to next item
        x++;

        // any more items in array? continue loop
        if(x < arr.length) {
            loopArray(arr);   
        }
        else {
          console.log("we are done!");
          console.log(vesselCountryArray);
        }
    }); 
}

function customAlert(vessel,callback) {

    // Here we do the stuff
    // console.log(vessel);
    console.log(vessel);

    var lat = vessel.lat;
    var lng = vessel.lng;
    var urlPart = "lat=" +lat +"&lon=" +lng;
    var url = "https://nominatim.openstreetmap.org/reverse?format=json&" +urlPart +"&zoom=0&addressdetails=1";
    $.getJSON(url, function(json){
      var country = json.address.country;
      vesselCountryArray.push({"VesselID": vessel.vesselId, "DestinationCountry": country}); // vesselID is wrong here, always the last in the list
      callback();                                                           // call vesselIDReplacer after all getJSONs have been done to compensate
    });

    
}


// To be called once getJSON is complete
// This is called manually. Dont know how to call it once a getJSON is complete with appropriate vessel
function vesselIDReplacer ()
{
  for (var i = 0; i<vesselCountryArray.length; i++)
  {
    vesselCountryArray[i].VesselID = vesselArray[i].vesselId;
    console.log(vesselCountryArray[i]);
  }
}



// Initializes google map. Is called in a callback asyncronized at the bottom of the html body
function initMap ()
{
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 59.349405116200636, lng: 18.072359561920166},
      zoom: 2,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
    zoomControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    mapTypeControl: true,
  });
}

// Main function, called from index.html
function main ()
{
  initMap();
  vesselDestination();
  // constructVesselCountryArray();
  loopArray(vesselArray);
  // console.log("Manually call vesselIDReplacer() in the console once getJSON-stuff is complete to set the right vessel to the right country. \n\nI don't know how to call vesselIDReplacer() once a getJSON is complete with the right vessel. ");
  // console.log("Print vesselCountryArray to see that it is faulty. ");
  // console.log("Call vesselIDReplacer() which should make it right (given that all getJSON calls have been done. ");

}
