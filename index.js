// MIT License
//
//
// Copyright (c) 2017 Red Pebble by John Ozbay, Shelby Hutchison, Senem Cinar
// http://pebble.red
// Made using the amazing API from http://marsweather.ingenology.com/ with data from Centro de Astrobiologia (CSIC-INTA)
//
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

process.env.DEBUG = 'actions-on-google:*';
var Assistant = require('actions-on-google').ApiAiAssistant;
var firebase = require("firebase-admin");
var http = require('http');

//////////////////////////////////////////////////////
// INITIALIZE FIREBASE ADMIN WITH CREDENTIALS HERE. //
firebase.initializeApp({ ... });
//////////////////////////////////////////////////////


//Useful to pick random strings from an array.
Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
};


// For Google Cloud Functions
exports.redPebble = function redPebble(req, res) {
  var assistant = new Assistant({request: req, response: res});
  var userId = assistant.getUser().user_id;
  var marsData;

  //Check if this is an existing user, if so, don't ask if they'd like to know more etc.
  function checkUser (userId, sentence){
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('users/' + userId).once('value', function (data) {
      if (data.val()) {
        //existing user
        firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getMarsWeather - existing" },function(){
          assistant.ask(sentence);
        });
      } else {
        firebase.database().ref('users/' + userId).update({ "lastused": milliseconds },function(){
          firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getMarsWeather - new" },function(){
            assistant.ask(sentence + " Would you like to know other things, like the season or sunset time on mars?");
          });
        });
      }
    });
  }

  // Didn't understand what the user said.
  function unhandledDeepLinks () {
    var sentence;
    var idks = [
      "Houston, we have a problem. I didn’t understand the weather.",
      "Meteors caused radio interference, can you repeat?",
      "Sorry! The line spaced out, can you repeat that?"
    ];
    sentence = idks.random();
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "unhandledDeepLinks" },function(){
      assistant.ask("Houston we have a problem. Didn't understand the question. Could you repeat that?");
    });
  }

  // "What's the weather like on Mars?"
  function getMarsWeather () {

    var cAvg = Math.floor((marsData.report.min_temp + marsData.report.max_temp) / 2);
    var fAvg = Math.floor((marsData.report.min_temp_fahrenheit + marsData.report.max_temp_fahrenheit) / 2);
    var temp = fAvg;
    var sentence = "";

    var hots = [
      "Gosh it's hot! It's a " + marsData.report.atmo_opacity + " " + temp + " degrees right now!",
      "It’d be pretty nice to have a beach right about now. It’s a hot " + temp + " degrees.",
    ];

    var warms = [
      "Great! You're just in time for lemonade! Today will be a lovely " + temp + " degrees!",
      "A warm day out here. It’s a lovely " + temp + " degrees!",
    ];

    var neutrals = [
      "What a beautiful day! Today is a perfect " + marsData.report.atmo_opacity + " " + temp + " degrees!",
      "Get out that sun visor, we’re going on a space walk! It’s a great " + temp + " degrees!",
    ];

    var colds = [
      "Get those hand warmers, today is a chilly " + temp + " degrees!",
      "Break out those space boots! It’s a cold " + temp + " degrees!",
    ];

    var frozens = [
      "Can planets hibernate? It's a freezing " + marsData.report.atmo_opacity + " " + temp + " degrees!",
      "Now I know how Pluto feels. It’s only " + temp + " degrees.",
    ];

    if (temp <= -146)                   { sentence = frozens.random();  }
    if ((temp > -146) && (temp <= -92)) { sentence = colds.random();    }
    if ((temp > -92) && (temp <= -38))  { sentence = neutrals.random(); }
    if ((temp > -38) && (temp <= 16))   { sentence = warms.random();    }
    if ((temp > 16) && (temp <= 70))    { sentence = hots.random();     }
    if (temp > 70)                      { sentence = hots.random();     }

    checkUser (userId, sentence);
  }

// "What's the date on Earth?"
  function getEarthDate () {
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getEarthDate" },function(){
      assistant.ask("Today's date is " + marsData.report.terrestrial_date + ' on Earth!');
    });
  }

  // "What's the date on Mars?"
  function getMarsDate () {
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getMarsDate" },function(){
      assistant.ask('Today is Sol ' + marsData.report.sol + " on Mars!");
    });
  }

  // "What's the season on Mars?"
  function getSeason () {
    var season;
    if (marsData.report.ls <= 90)                                   { season = "spring"; }
    if ((marsData.report.ls > 90) && (marsData.report.ls <= 180))   { season = "summer"; }
    if ((marsData.report.ls > 180) && (marsData.report.ls <= 270))  { season = "autumn"; }
    if (marsData.report.ls > 270)                                   { season = "winter"; }

    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getSeason" },function(){
      assistant.ask("Currently it's the equivalent of " + season + ' on Mars!');
    });
  }

  // "What's the lowest temperature on Mars?"
  function getMinTemp () {
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getMinTemp" },function(){
      assistant.ask('The lowest temperature on Mars today is ' + Math.floor(marsData.report.min_temp_fahrenheit) + ' degrees!');
    });
  }

  // "What's the highest temperature on Mars?"
  function getMaxTemp () {
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getMaxTemp" },function(){
      assistant.ask('The highest temperature on Mars today is ' + Math.floor(marsData.report.max_temp_fahrenheit) + ' degrees!');
    });
  }

  // "Is it cold on Mars?"
  function getCold () {
    var cAvg = Math.floor((marsData.report.min_temp + marsData.report.max_temp) / 2);
    var fAvg = Math.floor((marsData.report.min_temp_fahrenheit + marsData.report.max_temp_fahrenheit) / 2);
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getCold" },function(){
      assistant.ask('Yes! Today is ' + fAvg + " degrees. If you're coming to visit me, have a jacket handy.");
    });
  }

// "What's the atmospheric pressure on Mars?"
  function getAtmPres () {
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getAtmPres" },function(){
      assistant.ask('The average atmospheric pressure on Mars today is ' + Math.floor(marsData.report.pressure) + ' pascals!');
    });
  }

  // "When does the sun set on Mars?" -- According to Curiosity Rover
  function getSunset () {
    var time = marsData.report.sunset.split('T')[1];
    var hour = time.split(":")[0];
    var mins = time.split(':')[1];
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getSunset" },function(){
      assistant.ask('The sunset is at ' + hour + " " + mins + ".");
    });
  }

  // "When's the sunrise on Mars?" -- According to Curiosity Rover
  function getSunrise () {
    var time = marsData.report.sunrise.split('T')[1];
    var hour = time.split(":")[0];
    var mins = time.split(':')[1];
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "getSunrise" },function(){
      assistant.ask('The sunrise is at ' + hour + " " + mins + ".");
    });
  }

  // "Does the sun set on Mars?"
  function doesSunset () {
    var time = marsData.report.sunset.split('T')[1];
    var hour = time.split(":")[0];
    var mins = time.split(':')[1];
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "doesSunset" },function(){
      assistant.ask('Yes! The sunset is at ' + hour + " " + mins + ".");
    });
  }

  // "Does the sun rise on Mars?"
  function doesSunrise () {
    var time = marsData.report.sunrise.split('T')[1];
    var hour = time.split(":")[0];
    var mins = time.split(':')[1];
    var milliseconds = (new Date()).getTime();
    firebase.database().ref('stats/' + milliseconds).update({ user: userId, comm: "doesSunrise" },function(){
      assistant.ask('Yes! The sunrise is at ' + hour + " " + mins + ".");
    });
  }

  // Main response handler that checks the latest weather json file. Updated daily.
  function responseHandler (callback){
    http.get('http://pebble.red/latest.json', function (res) {
      if (('' + res.statusCode).match(/^2\d\d$/)) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on("end", function() {
          console.log("BODY: ", body);
          marsData = JSON.parse(body);
          console.log("MARSDATA: ", marsData);
          var intent = assistant.getIntent();
          switch (intent) {
            case 'deeplink.unknown'               : unhandledDeepLinks(); break;
            case 'get_mars_weather'               : getMarsWeather();     break;
            case 'get_mars_earth_date'            : getEarthDate();       break;
            case 'get_mars_date'                  : getMarsDate();        break;
            case 'get_mars_season'                : getSeason();          break;
            case 'get_mars_min_temp'              : getMinTemp();         break;
            case 'get_mars_max_temp'              : getMaxTemp();         break;
            case 'get_mars_atmospheric_pressure'  : getAtmPres();         break;
            case 'get_mars_sunset'                : getSunset();          break;
            case 'get_mars_sunrise'               : getSunrise();         break;
            case 'get_does_sunset'                : doesSunset();         break;
            case 'get_does_sunrise'               : doesSunrise();        break;
            case 'get_mars_cold'                  : getCold();            break;
          }
        });
      }
    });
  }

  assistant.handleRequest(responseHandler);

};
