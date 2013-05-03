var app = {
    // Application Constructor
    initialize: function() {
        console.log("init");
        this.bindEvents();
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
            console.log("swiperight");
            if (councillors.currentPanel == "find") {
                councillors.showMain();
            }
        });
        Hammer(document.body).on("swipeleft", function() {
            console.log("swipeleft");
            if (councillors.currentPanel != "find") {
                councillors.showFind();
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
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);

        console.log('Received Event: ' + id);
    },
    loadStrings: function() {        
        navigator.globalization.getLocaleName(
            function (locale) {
                console.log("locale = " + locale.value);
                var lang = "en_US";
                // default to english if not canadian french
                if (locale.value == "fr_CA" || locale.value == "fr_FR") { 
                    lang = "fr_CA";
                }
                XHR("i18n/strings-"+lang+".json", function(data) {
                    AppStrings = JSON.parse(data);  
                    app.localize();                     
                });
            },
            function () {console.log('Error getting locale\n');}
        );
    },
    localize: function() {
        var find = document.getElementById("find");
        find.innerHTML = HungryFox.applyTemplate({}, find.innerHTML);

        var tabbar = document.getElementById("tabbar");
        tabbar.innerHTML = HungryFox.applyTemplate({}, tabbar.innerHTML);
        
        // bind click events
        document.getElementById("searchBtn").addEventListener('click', searchCouncillor, false);
        document.getElementById("cBtn").addEventListener('click', councillors.showMain, false);
        document.getElementById("fBtn").addEventListener('click', councillors.showFind, false);        
    }
};

var councillors = {
    items: [],
    currentPanel: "main",
    loadCouncillors: function() {
        var that = this;
        XHR("data/elected_officials.json", function(data) {
            that.items = JSON.parse(data);
            that.listCouncillors();
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
            line2.appendChild(document.createTextNode(councillor["District name"]))
            item.appendChild(line1);
            item.appendChild(line2);
            
            var line3 = document.createElement("p");
            line3.setAttribute("class", "line3");
            if (councillor["District ID"] === "0") {
            	line3.appendChild(document.createTextNode("Mayor")); 
             } else {
            	line3.appendChild(document.createTextNode("Ward " + councillor["District ID"]  ));            
            }
            
            item.appendChild(line3);
            list.appendChild(item);
            document.body.appendChild(this.createPanel(councillor, text));
        }
        main.appendChild(list);
    },    
    showCouncillor: function(evt) {
        console.log("current: " + councillors.currentPanel);
        var srcElement = evt.srcElement;
        while(srcElement.tagName != "LI") {
            srcElement = srcElement.parentNode;
        }
        councillors.showCouncillorByWard(srcElement.id);
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
        document.getElementById("add").setAttribute("style", "display: block");
        document.getElementById("addPerson").setAttribute("onclick", "councillors.saveContact('" + id + "')");
        document.getElementById("search").setAttribute("style", "display: none");
        
        // show the back button in top bar
        document.getElementById("backIcon").setAttribute("style", "display: table-cell");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showMain: function() {
        console.log("did we get the back button event");
        console.log("current: " + councillors.currentPanel);
        var panel = document.getElementById(councillors.currentPanel);
        panel.setAttribute("style", "display: none");
        var main = document.getElementById("main");
        main.setAttribute("style", "display: block");
        councillors.currentPanel = "main";
        var that=this;
        document.removeEventListener("backbutton", councillors.showMain, false);

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        document.getElementById("search").setAttribute("style", "display: none");
        
        // hide the back button in top bar
        document.getElementById("backIcon").setAttribute("style", "display: none");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showFind: function() {
        console.log("current: " + councillors.currentPanel);
        var main = document.getElementById(councillors.currentPanel);
        main.setAttribute("style", "display: none");
        var find = document.getElementById("find");
        find.setAttribute("style", "display: block");
        councillors.currentPanel = "find";

        document.removeEventListener("backbutton", councillors.showMain, false);

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        document.getElementById("search").setAttribute("style", "display: block");
        
        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("fBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
    },
    createPanel: function(councillor, text) {
        var panel = document.createElement("div");
        panel.setAttribute("style", "display: none");
        panel.setAttribute("id", "panel"+councillor["District ID"]);
        if (councillor["District ID"] === "0") {
        // Mayor
        	console.log("createPanel: mayor");
        } else {
           var str = "{\"Elected office\": \"" + AppStrings.councillor + " - " + AppStrings.ward + " " + councillor['District ID'] + "\"} " ;
          
           var data = JSON.parse(str);
           var temp = HungryFox.applyTemplate(data, text); 
           panel.innerHTML = HungryFox.applyTemplate(councillor, temp);
   
           return panel;
        }

        panel.innerHTML = HungryFox.applyTemplate(councillor, text);
        return panel;
    },
    saveContact: function(id) {
        console.log("save contact");
        console.log("id = " + id);
        for (var i=0; i<this.items.length; i++) {
            var councillor = this.items[i];
            if (councillor["District ID"] == id) {
                console.log("found councillor");
                console.log("district = " + councillor["District ID"] + " i = " + i);
                console.log(councillor["Last name"]);
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
