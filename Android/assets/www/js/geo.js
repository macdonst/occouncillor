var whereami = function() {
    navigator.geolocation.getCurrentPosition(function(position) {
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
                            console.log("Ward Name = " + response.objects[i].name);
                            councillors.showCouncillorByWard(response.objects[i].external_id);
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

var findMe = function() {
    var postcode = document.getElementById("postcode").value.toUpperCase();
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
