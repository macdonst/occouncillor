var wardID = 0;
var wardName = "";

var whereami = function() {
    console.log("whereami called");
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log("got position");
        var request = new XMLHttpRequest();
        request.open("GET", "http://represent.opennorth.ca/boundaries/?contains=" + 
            position.coords.latitude + "," + position.coords.longitude, true);
        request.onreadystatechange = function(){
            if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                    //console.log("response " + request.responseText);
                    var response = JSON.parse(request.responseText);
                    for (var i=0; i<response.objects.length; i++) {
                        if (response.objects[i].url.indexOf("/boundaries/ottawa-wards") == 0) {
                            console.log("Ward ID = " + response.objects[i].external_id);
                            wardID = response.objects[i].external_id;
                            console.log("Ward Name = " + response.objects[i].name);
                            wardName = response.objects[i].name;
                            //councillors.showCouncillorByWard(response.objects[i].external_id);
                            var curLoc = document.getElementById("currentLocation");
                            if (wardID !== 0) {
                                curLoc.innerText = "Ward " + wardID + " - " + wardName;
                            } else {
                                curLoc.innerText = "wardName";
                            }
                            break;
                        }                        
                    }
                }
            }
        }
        request.send();      
    }, function(error) {
        console.log("error = " + error.code);
    }, { enableHighAccuracy: true });
}

var findMe = function(postcode) {
    //var postcode = document.getElementById("postcode").value.toUpperCase();
    postcode = postcode.replace(/\s/g, '');
    console.log("postcode = " + postcode);
    var request = new XMLHttpRequest();
    request.open("GET", "http://represent.opennorth.ca/postcodes/" + postcode + "/", true);
    request.onreadystatechange = function(){
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 0) {
                var response = JSON.parse(request.responseText);
                for (var i=0; i<response.boundaries_centroid.length; i++) {
                    if (response.boundaries_centroid[i].url.indexOf("/boundaries/ottawa-wards") == 0) {
                        console.log("Ward ID = " + response.boundaries_centroid[i].external_id);
                        councillors.showCouncillorByWard(response.boundaries_centroid[i].external_id);
                        break;
                    }                        
                }
            }
        }
    }
    request.send();      
}

var searchCouncillor = function() {
    var postcode = document.getElementById("postcode").value.toUpperCase();
    if (postcode !== "" && postcode !== "POSTAL CODE") {
        findMe(postcode);
    } else {
        councillors.showCouncillorByWard(wardID);
    }
}
