/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log("we got a deviceready");
        app.receivedEvent('deviceready');
        councillors.loadCouncillors();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var councillors = {
    items: [],
    currentPanel: "main",
    loadCouncillors: function() {
        var that = this;
        var request = new XMLHttpRequest();
        request.open("GET", "data/elected_officials.json", true);
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                    //console.log(JSON.stringify(this));
                    that.items = JSON.parse(request.responseText);
                    that.listCouncillors();
                }
            }
        }
        request.send();
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
            item.appendChild(document.createTextNode(
                councillor["First name"] + " " + councillor["Last name"] +
                " - " + councillor["District name"]));
            list.appendChild(item);
            document.body.appendChild(this.createPanel(councillor, text));
        }
        main.appendChild(list);
    },    
    showCouncillor: function(evt) {
        console.log("I got clicked:" + evt.srcElement.id);
        var panel = document.getElementById("panel"+evt.srcElement.id);
        panel.setAttribute("style", "display: block");
        var main = document.getElementById("main");
        main.setAttribute("style", "display: none");
        currentPanel = "panel"+evt.srcElement.id;
        var that = this;
        document.addEventListener("backbutton", councillors.showMain, false);
    }, 
    showMain: function() {
        console.log("did we get the back button event");
        var panel = document.getElementById(currentPanel);
        panel.setAttribute("style", "display: none");
        var main = document.getElementById("main");
        main.setAttribute("style", "display: block");
        currentPanel = "main";
        var that=this;
        document.removeEventListener("backbutton", councillors.showMain, false);
    },
    createPanel: function(councillor, text) {
        var panel = document.createElement("div");
        panel.setAttribute("style", "display: none");
        panel.setAttribute("id", "panel"+councillor["District ID"]);
        panel.innerHTML = HungryFox.applyTemplate(councillor, text);
        return panel;
    }
};

var HungryFox = {
    applyTemplate: function(data, template) {
        for (var prop in data) {
            if (template.indexOf("{{" + prop + "}}") !== -1) {
                var re = new RegExp("\{\{" + prop + "\}\}", "g");
                template = template.replace(re, data[prop]);
            }
        }
        return template;  
    }  
};
