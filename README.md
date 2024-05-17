# gis_mapping_final
 ## US airport and population map
Direct link to the published webpage on Github pages: https://tysong0.github.io/gis_mapping_final/ (<b>feel free to try it out</b> - there is no charge-on-quota API usage so <b>I won't be charged!</b>)

I made this map inspired by seeing how <b>Flightradar24</b> (https://www.flightradar24.com/) is useful in tracking deplomatic events is and by running into a few aviation open data websites (including the OpenSky, https://opensky-network.org/).
United States has one of the most freedom skies in the world. General aviation occupies the sky with many have their own light aircraft for leisure, or even for commute. In addition, geographical and socio-demographical features of this big country have greatly facilitated travelling by air. Airlines of the US tops the world in terms of operated flights. Taking flights across the country is an everyday act of Americans.
<br>
Therefore, this map tries to explore the distribution of the major airports with scheduled passenger service of US. Bundled with the population layer, and isochrone area of individual airports, you can explore how population distribution affected the clustering of airports, as well as how many population is served by the major airports - in terms of 1 hour of driving, both visually and intuitively.

## Features
 - Globe view with Mapbox default style as the base map
 - See the <b>location</b> of the major airports of US (ones with scheduled service) visually on the map
 - Size of the airports are displayed intuitively as markers with different colors - from cyan to grey
 - <b>Sometimes the loading of isochrone area can be a bit slow because they are calculated real-time from the Isochrone API</b>. Don't worry, <b><i>we got you back!</i></b> Just look at the loading spinner for a while and we will get the data there.
 - You can use <b>the location function</b> to tell the map where you are - location data is off by default to protect your privacy - and see whether one airport is within one hour driving distance of yours. Why not pack and hop on a flight some time?
 - What's more, airport data is joined by <b>population statistics</b> (fetched from Mapbox), with state and county level population data available
 - Level of detail is determined by the zoom level. It begins with county population at default zoom - zoom out, the state data will appear
 - The deeper the color, the more the population there is in that given county/state
 - If you are not interested in statistics and only want to know location and name of airports - <b><i>totally fine</i></b>, just <b>toggle</b> the population layer off through the little switch

## Future developments
This map has only achieved a small part of its intended functions, due to time constraints and technical difficulties (forgive me being a beginner in js and html coding). It is originally planned to be (on top of existing functions) national air route finder or at least of NYC region. Air route APIs are the planned data sources (preferrably Aviationstack https://aviationstack.com/), and imagine clicking on one of the airports, routes will originate from the marker to the destinations served by scheduled flights and you can check the general on-time performance of airlines from that airport to make informed booking decisions.
Other dropped features:
- A search box (didn't figured out how to initiate the Searchbox API)
- Airport filters (for not being able to find airport data in geojson/csv format and Mapbox markers are harder to generate/remove than layers)
- Clickable isochrone area (nothing to display)
- others

## Screenshots
![Overview]([http://url/to/img.png](https://github.com/tysong0/gis_mapping_final/blob/main/readme_img/Overview.jpg)
![The isochrone map]([http://url/to/img.png](https://github.com/tysong0/gis_mapping_final/blob/main/readme_img/Isochrone.jpg)
![The loading spinner]([http://url/to/img.png](https://github.com/tysong0/gis_mapping_final/blob/main/readme_img/Loading.jpg)
