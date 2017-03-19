# ![Red Pebble](http://pebble.red/red-pebble-black.png)

http://pebble.red

Red Pebble, a Google Assistant &amp; Google Home bot, that tells you everything about the weather on Mars!

## How does it work?

Red Pebble uses data from [Centro de Astrobiologia (CSIC-INTA)](http://www.cab.inta.es/en/inicio) using the amazing API kindly provided by [{MAAS} API](http://marsweather.ingenology.com/)

The weather & atmospheric data is being transmitted by the Curiosity Rover on Mars.

We then cache this atmospheric weather information daily using Google Cloud Functions on our own servers to make sure that our assistant doesn't make tons of requests to the kind providers of the API listed above.

Our cached version of the API can be found here :
http://pebble.red/latest.json     

You're more than welcome to use our mirror for your projects. 

Red Pebble is built using [API.AI](http://api.ai), [Google Cloud Functions](https://cloud.google.com/functions/) and [Firebase](firebase.google.com).

Red Pebble has two types of answers.  

* Informative interactions that doesn't require the use of the weather API. These are questions like : "Are there any clouds on Mars?" or "Does it rain on Mars?" etc. These types of questions, that doesn't require any up-to date weather information are handled by api.ai.

* Interactions that require the use of the weather API. These are questions like : "What's the temperature on Mars?" or "What's the season on Mars?" etc. These types of questions are first received by api.ai, which in return makes a call to our cloud functions server that fetches the latest info from [our cached latest.json file](http://pebble.red/latest.json) and finally return the answer to the user.

We decided to use Google Cloud Functions for this project, and we believe that it's a great way to create assistants / chat bots without worrying about handling large loads, scaling or traffic.

The Cloud Function also logs anonymous user IDs to change the way it responds to save them time and frustration. This part is handled by Firebase. We intend to use this information to also improve the quality of Red Pebble's answers and conversational structure.

## Where did the idea come from?

One day [Shelby Hutchison](http://www.shdigitaldesign.com/), [Senem Cinar](http://senemcinar.com/) and [I](https://johnozbay.com) were having breakfast and we thought wouldn't it be hilarious and awesome to have a home assistant that tells the weather on Mars. Then for 7 days after work, we all went home, didn't sleep, designed and coded an assistant that does just that.

## Questions, Bugs, Suggestions?

Don't be shy, file an issue, feature or bug report. And don't forget to fork it, share it or star it.

## Thanks

[{MAAS} API](http://marsweather.ingenology.com/)

[Centro de Astrobiologia (CSIC-INTA)](http://www.cab.inta.es/en/inicio)

And everyone from the Google Home Hackathon NYC 2017 for helping and supporting us.
