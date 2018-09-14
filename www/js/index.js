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
    this.bindEvents();
  },
  browser: {

  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  // app.receivedEvent('deviceready');
  onDeviceReady: function() {
    app.browser = cordova.InAppBrowser.open('http://box2.stb.to:3000/', '_blank', 'location=no');

    function b64EncodeUnicode(str) {
      // first we use encodeURIComponent to get percent-encoded UTF-8,
      // then we convert the percent encodings into raw bytes which
      // can be fed into btoa.
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
        }));
    }


    var onLoadstart = function(event) {
      if (event.url.endsWith("/plugin1")) {
        var srcType = Camera.PictureSourceType.CAMERA;
        var options = {
          // Some common settings are 20, 50, and 100
          quality: 100,
          destinationType: Camera.DestinationType.DATA_URL,
          // In this app, dynamically set the picture source, Camera or photo gallery
          sourceType: srcType,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
          allowEdit: true,
          correctOrientation: true //Corrects Android orientation quirks
        };

        TesseractPlugin.loadLanguage("eng", function(response) {
          navigator.camera.getPicture(function(imageData) {
            TesseractPlugin.recognizeText(imageData, "eng", function(recognizedText) {
              alert(recognizedText);
              var val = b64EncodeUnicode(recognizedText);
              app.browser.executeScript({
                code: "localStorage.setItem( 'recognizedText', '" + val + "' );"
              });

            }, function(reason) {
              alert('Error on recognizing text from image. ' + reason);
            });
          }, function(error) {
            alert("Unable to obtain picture: " + error, "app");
          }, options);
        }, function(reason) {
          alert('Error on loading OCR file for your language. ' + reason);
        });

      } else if (event.url.endsWith("/plugin2")) {
        window.plugins.launcher.launch({
          packageName: 'com.facebook.katana'
        }, function(data) {
          alert("Success!");
          // if calling canLaunch() with getAppList:true, data will contain an array named "appList" with the package names of 					applications that can handle the uri specified.
        }, function(errMsg) {
          alert("Error! " + errMsg);
        });
      } else if (event.url.endsWith("/plugin3")) {
        navigator.health.requestAuthorization([
          'calories', 'distance', 'weight', 'height', 'steps' // Read and write permissions
          //, {
          //  read : ['steps'],       // Read only permission
          //  write : ['height', 'weight']  // Write only permission
          //}
        ], function(data) {
          navigator.health.query({
            startDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
            endDate: new Date(), // now
            dataType: 'weight',
            limit: 1000
          }, function(data) {
            alert(JSON.stringify(data));
            var val = b64EncodeUnicode(JSON.stringify(data));
            app.browser.executeScript({
              code: "localStorage.setItem( 'data', '" + val + "' );"
            });
            // if calling canLaunch() with getAppList:true, data will contain an array named "appList" with the package names of 					applications that can handle the uri specified.
          }, function(errMsg) {
            alert("Error2! " + errMsg);
          });

          // if calling canLaunch() with getAppList:true, data will contain an array named "appList" with the package names of 					applications that can handle the uri specified.
        }, function(errMsg) {
          alert("Error1! " + errMsg);
        });
      }
    }
    app.browser.addEventListener('loadstart', onLoadstart);
  }
};

app.initialize();
