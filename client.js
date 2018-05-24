function loadContent( url, element) {
    // Create our XMLHttpRequest object
    var hr = new XMLHttpRequest();
    
    //var url ="listAlbums";
   // alert(url);
    hr.open("GET", url, true);
    // Set content type header information for sending url encoded variables in the request
    hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    hr.onreadystatechange = function() {
        if(hr.readyState == 4 && hr.status == 200) {
            var return_data = hr.responseText;
            document.getElementById(element).innerHTML =return_data;
        }
    }
    // Send the data now
    hr.send(); // Actually execute the request
    document.getElementById(element).innerHTML ="processing...";
}

function dltAlbum(id){
    // Create our XMLHttpRequest object
    var hr = new XMLHttpRequest();
    var url ="deleteAlbum/"+ id;
    hr.open("DELETE", url, true);
    // Set content type header information for sending url encoded variables in the request
    hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    hr.onreadystatechange = function() {
       window.location.replace("gallery");
    }
    // Send the data now
    hr.send(); // Actually execute the request
    //document.getElementById("album-section").innerHTML ="processing...";
}