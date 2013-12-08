var app = {
    // Application Constructor
    initialize: function() {
        //console.log("init");
        this.bindEvents();
        this.onDeviceReady();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log("bind");
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        // Fast click
        new FastClick(document.body);
        
        // Swipe events
        Hammer(document.body).on("swiperight", function() {
            if (councillors.currentPanel == "find") {
                councillors.showWards();
               
            } else if (councillors.currentPanel == "wards" || councillors.currentPanel.startsWith("wardPanel")) {
                councillors.showMain();
            }
        });
        Hammer(document.body).on("swipeleft", function() {
            if (councillors.currentPanel == "wards" || councillors.currentPanel.startsWith("wardPanel")) {
                councillors.showFind();
            } else if (councillors.currentPanel == "main" || councillors.currentPanel.startsWith("panel")) {
                councillors.showWards();
            }
        });
        
        // Click events
        document.getElementById("left").addEventListener('click', councillors.showMain, false);
        document.getElementById("search").addEventListener('click', searchCouncillor, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log("we got a deviceready");
        console.log("width = " + window.innerWidth);
        console.log("height = " + window.innerHeight);
        
        // load language strings
        app.loadStrings();

        app.receivedEvent('deviceready');
        whereami();
        councillors.loadCouncillors();
        councillors.loadWards();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);

        console.log('Received Event: ' + id);
    },
    loadStrings: function() {        
        //navigator.globalization.getLocaleName(
        //    function (locale) {
        //        console.log("locale = " + locale.value);
                var lang = "en_US";
                // default to english if not canadian french
        //        if (locale.value == "fr_CA" || locale.value == "fr_FR") { 
        //            lang = "fr_CA";
        //        }
                councillors.setLocal(lang);
                XHR("i18n/strings-"+lang+".json", function(data) {
                    AppStrings = JSON.parse(data);  
                    app.localize();                     
                });
        //    },
        //    function () {console.log('Error getting locale\n');}
        //);
    },
    localize: function() {
        var find = document.getElementById("find");
        find.innerHTML = HungryFox.applyTemplate({}, find.innerHTML);

        var tabbar = document.getElementById("tabbar");
        tabbar.innerHTML = HungryFox.applyTemplate({}, tabbar.innerHTML);
        
        // bind click events
        document.getElementById("searchBtn").addEventListener('click', searchCouncillor, false);
        document.getElementById("cBtn").addEventListener('click', councillors.showMain, false);
        document.getElementById("wBtn").addEventListener('click', councillors.showWards, false);
        document.getElementById("fBtn").addEventListener('click', councillors.showFind, false);        
    }
};

var councillors = {
    items: [],
    wards: [],
    locale: "en_US",
    currentPanel: "main",
    loadCouncillors: function() {
        var that = this;
        XHR("data/elected_officials.json", function(data) {
            that.items = JSON.parse(data);
            that.listCouncillors();
        });
    },
    setLocal: function (loc) {
    	console.log("setLocal = " + loc);
        this.locale = loc;
    },
    loadWards: function() {
        var wards = this;
        XHR("data/ward_info.json", function(data) {
            wards.wards = JSON.parse(data);
            wards.listWards();
        });
    },
    listCouncillors: function() {
        var text = document.getElementById("councillor-template").innerHTML;
        var list = document.createElement("ul");
        list.addEventListener("click", this.showCouncillor, true);
        var main = document.getElementById("main");
        for(var i = 0; i < this.items.length; i++) {
            var councillor = this.items[i];
            //console.log(JSON.stringify(councillor));        
            var item = document.createElement("li");
            item.setAttribute("id", councillor["District ID"]);
            var cpic = document.createElement("img");
            cpic.setAttribute("src", councillor["Photo URL"]);
            cpic.setAttribute("class", "list-icon");
            item.appendChild(cpic);
            var line1 = document.createElement("p");
            line1.setAttribute("class", "line1");
            line1.appendChild(document.createTextNode(councillor["First name"] + " " + councillor["Last name"]))
            var line2 = document.createElement("p");
            line2.setAttribute("class", "line2");
            
            var ward_name_set = "ward_name_"+councillor["District ID"];           
            councillor["district_name_set"] = AppStrings[ward_name_set];
                                              
			if (councillor["District ID"] === "0") {
            	line2.appendChild(document.createTextNode(AppStrings.city_of_ottawa));
            } else {
            	line2.appendChild(document.createTextNode(councillor["district_name_set"]));
            }                        
            item.appendChild(line1);
            item.appendChild(line2);
            
            var line3 = document.createElement("p");
            line3.setAttribute("class", "line3");
            if (councillor["District ID"] === "0") {
            	line3.appendChild(document.createTextNode(AppStrings.ward_name_0)); 
             } else {
            	line3.appendChild(document.createTextNode(AppStrings.ward + " " + councillor["District ID"]  ));            
            }
            
            item.appendChild(line3);
            list.appendChild(item);
            document.body.appendChild(this.createPanel(councillor, text));
        }
        main.appendChild(list);
    },
    listWards: function() {
        var text = document.getElementById("ward-template").innerHTML;
        var list = document.createElement("ul");
        list.addEventListener("click", this.showWard, true);
        var wardList = document.getElementById("wards");
        for(var i = 1; i < this.wards.length; i++) {
          var j = 0;
          var found = 0;
          while ((j < this.wards.length) && (found==0) ) {  
           
            var current = this.wards[j];
  
            if (parseInt(current["District ID"]) == i) {
            	var councillor = this.items[j];
            	
            	found = 1;   
				var ward = this.wards[j];
				var ward_name_set = "ward_name_"+councillor["District ID"];   
				ward["district_name_set"] = AppStrings[ward_name_set];
				
                //console.log("listWards() - this.locale = " + this.locale);
                if (this.locale === "fr_CA") {
                	ward["map_url_set"] = ward["map_url_fr"];                	
                	
                } else {
                	ward["map_url_set"] = ward["map_url_en"];
                }
                // console.log("map_url =" + ward["map_url"] );
            	
           		//console.log("WARD = " + JSON.stringify(ward));        
            	var item = document.createElement("li");
            	item.setAttribute("id", ward["District ID"]);
            	var line1 = document.createElement("p");
            	line1.setAttribute("class", "line_ward");
            	line1.appendChild(document.createTextNode(AppStrings.ward + " " + ward["District ID"] + " -  " + ward["district_name_set"] ));
         
            	item.appendChild(line1);
          
            	list.appendChild(item);
            	document.body.appendChild(this.createWardPanel(councillor, ward, text));
            
            }  // if item at j = id of i 
            j++;
        }
        }
        wardList.appendChild(list);
    },    
    showCouncillor: function(evt) {
        // console.log("current: " + councillors.currentPanel);
        var srcElement = evt.target || evt.srcElement;
        console.log("clicked = " + srcElement.tagName);
        while(srcElement.tagName != "LI") {
            srcElement = srcElement.parentNode;
        }
        councillors.showCouncillorByWard(srcElement.id);

        
        document.getElementById("left").removeEventListener('click', councillors.showWards, false);        
        document.getElementById("left").addEventListener('click', councillors.showMain, false);
    }, 
    showCouncillorByWard: function(id) {
        var panel = document.getElementById("panel"+id);
        panel.setAttribute("class", "councillor-template");
        panel.setAttribute("style", "display: block");
        var main = document.getElementById(councillors.currentPanel);
        main.setAttribute("style", "display: none");
        councillors.currentPanel = "panel"+id;
        var that = this;        
        document.addEventListener("backbutton", councillors.showMain, false);
        
        // setup the add contact button
        //document.getElementById("add").setAttribute("style", "display: block");
        //document.getElementById("addPerson").setAttribute("onclick", "councillors.saveContact('" + id + "')");
        document.getElementById("search").setAttribute("style", "display: none");
        
        // show the back button in top bar
        document.getElementById("backIcon").setAttribute("style", "display: table-cell");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showMain: function() {
        //console.log("did we get the back button event");
        //console.log("showMain current: " + councillors.currentPanel);
        var panel = document.getElementById(councillors.currentPanel);
        panel.setAttribute("style", "display: none");
        var main = document.getElementById("main");
        main.setAttribute("style", "display: block");
        councillors.currentPanel = "main";
        //console.log("showMain current: " + councillors.currentPanel);
        var that=this;
        document.removeEventListener("backbutton", councillors.showMain, false);
        document.removeEventListener("backbutton", councillors.showWards, false);

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        document.getElementById("search").setAttribute("style", "display: none");
        
        // hide the back button in top bar
        document.getElementById("backIcon").setAttribute("style", "display: none");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
         document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showWards: function() {
        //console.log("did we get the back button event");        
        //console.log("showWards current: " + councillors.currentPanel);
        var panel = document.getElementById(councillors.currentPanel);
        panel.setAttribute("style", "display: none");
        var wards = document.getElementById("wards");
        wards.setAttribute("style", "display: block");
        councillors.currentPanel = "wards";
        //console.log("showWards current: " + councillors.currentPanel);
        var that=this;
        document.removeEventListener("backbutton", councillors.showMain, false);
        document.removeEventListener("backbutton", councillors.showWards, false);

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        document.getElementById("search").setAttribute("style", "display: none");
        
        // hide the back button in top bar
        document.getElementById("backIcon").setAttribute("style", "display: none");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showFind: function() {
        //console.log("showFind current: " + councillors.currentPanel);
        var main = document.getElementById(councillors.currentPanel);
        main.setAttribute("style", "display: none");
        var find = document.getElementById("find");
        find.setAttribute("style", "display: block");
        councillors.currentPanel = "find";
        //console.log("showFind current: " + councillors.currentPanel);

        document.removeEventListener("backbutton", councillors.showMain, false);
        document.removeEventListener("backbutton", councillors.showWards, false);

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        document.getElementById("search").setAttribute("style", "display: block");
        
        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
    },
    createWardPanel: function(councillor, ward, text) {
        var panel = document.createElement("div");
       // console.log("createWardPanel : ward :" + ward["District ID"] + ", counc: " + councillor["District ID"]); 
        panel.setAttribute("style", "display: none");
        panel.setAttribute("id", "wardPanel"+ward["District ID"]);
        var temp = HungryFox.applyTemplate(councillor, text);
        //console.log("createWardPanel - first pass: \n" + temp);
        panel.innerHTML = HungryFox.applyTemplate(ward, temp);
        //console.log("\n\ncreateWardPanel - second pass: \n" + panel.innerHTML);
        
        return panel;
    },
    createPanel: function(councillor, text) {
        var panel = document.createElement("div");
        panel.setAttribute("style", "display: none");
        panel.setAttribute("id", "panel"+councillor["District ID"]);
        if (councillor["District ID"] === "0") {
            // Mayor
        	//console.log("createPanel: mayor");
           councillor["Elected office"] = AppStrings.city_of_ottawa;
        } else {
           councillor["Elected office"] = AppStrings.councillor + " - " + AppStrings.ward + " " + councillor['District ID'];
        }
        
        panel.innerHTML = HungryFox.applyTemplate(councillor, text);
   
        return panel;
    },
    showWard: function(evt) {
        //console.log("current: " + councillors.currentPanel);
        var srcElement = evt.target || evt.srcElement;
        while(srcElement.tagName != "LI") {
            srcElement = srcElement.parentNode;
        }
        councillors.showWardById(srcElement.id);
        document.getElementById("left").removeEventListener('click', councillors.showMain, false);
        document.getElementById("left").addEventListener('click', councillors.showWards, false);
    }, 
    showWardById: function(id) {
        var panel = document.getElementById("wardPanel"+id);
        panel.setAttribute("class", "ward-template");
        panel.setAttribute("style", "display: block");
        var main = document.getElementById(councillors.currentPanel);
        main.setAttribute("style", "display: none");
        councillors.currentPanel = "wardPanel"+id;
        var that = this;        
        document.addEventListener("backbutton", councillors.showWards, false);
        
        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        //document.getElementById("addPerson").setAttribute("onclick", "councillors.saveContact('" + id + "')");
        document.getElementById("search").setAttribute("style", "display: none");
        
        // show the back button in top bar
        document.getElementById("backIcon").setAttribute("style", "display: table-cell");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #black");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    
    saveContact: function(id) {
        //console.log("save contact");
        console.log("id = " + id);
        for (var i=0; i<this.items.length; i++) {
            var councillor = this.items[i];
            if (councillor["District ID"] == id) {
                //console.log("found councillor");
                //console.log("district = " + councillor["District ID"] + " i = " + i);
                //console.log(councillor["Last name"]);
                /*
                var contact = navigator.contacts.create();
                contact.displayName = councillor["First name"] + " " + councillor["Last name"];
                contact.name = new ContactName();
                contact.name.formatted = contact.displayName;
                contact.name.givenName = councillor["First name"];
                contact.name.familyName = councillor["Last name"];
                contact.phoneNumbers = [];
                contact.phoneNumbers.push(new ContactField("work", councillor["Phone"], false));
                contact.phoneNumbers.push(new ContactField("fax", councillor["Fax"], false));
                contact.emails = [];
                contact.emails.push(new ContactField("work", councillor["Email"], false));
                contact.urls = [];
                contact.urls.push(new ContactField("work", councillor["Personal URL"], false));
                //contact.photos = [];
                //contact.photos.push(new ContactField("work", councillor["Photo URL"], false));
                
                contact.save(function() {
                    navigator.notification.alert(contact.displayName, null, AppStrings.contactsaved);
                });
                */

                var person = new mozContact();
                person.givenName  = ["John"];
                person.familyName = ["Doe"];
                person.nickname   = ["No kidding"];
                
                // save the new contact
                var saving = navigator.mozContacts.save(person);

                saving.onsuccess = function() {
                  console.log('new contact saved');
                  // This update the person as it is stored
                  // It includes its internal unique ID
                  // Note that saving.result is null here
                };

                saving.onerror = function(err) {
                  console.error(err);
                };

                break;
            }
        }
    }
};

var AppStrings = {};

var HungryFox = {
    applyTemplate: function(data, template) {
        for (var prop in data) {
            if (template.indexOf("{{" + prop + "}}") !== -1) {
                var re = new RegExp("\{\{" + prop + "\}\}", "g");
                template = template.replace(re, data[prop]);
            }
        } 
        for (var prop in AppStrings) {
            if (template.indexOf("{{" + prop + "}}") !== -1) {
                var re = new RegExp("\{\{" + prop + "\}\}", "g");
                template = template.replace(re, AppStrings[prop]);
            }
        }
        return template;  
    }  
};

var XHR = function(url, success, fail) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 0) {
                //console.log("response = " + request.responseText);
                if (typeof success == "function") {
                    success(request.responseText);
                }
            } else {
                if (typeof fail == "function") {
                    fail();
                }
            }
        }
    }
    request.send();
}

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
             return this.indexOf(searchString, position) === position;
        }
    });
}
