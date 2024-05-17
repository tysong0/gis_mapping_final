// Define some variables, including location
var STARTING_CENTER = [-73.92960, 40.69906]
var ZOOM_SW = [-74.57402, 40.45758]
var ZOOM_NE = [-73.28518, 40.93966]
// Variables for isochrone
var aplngLat = null;
var aplng = 0;
var aplat = 0;

// Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
const profile = 'driving'; // Set the routing profile for isochrone calculation
const minutes = 60; // Set the duration of calculating isochrone area
// zoom threshold for change between state and county population overlay
const zoomThreshold = 6;

// Introduce the map
const ACCESS_TOKEN = 'pk.eyJ1IjoidGlhbnlzb25nIiwiYSI6ImNsdWx1OGVodzBqcWwyaW9hOW1oaWRnOWwifQ.E4RNl8ESZulQlGSzXECAMw';
mapboxgl.accessToken = ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'container', // container ID
    center: STARTING_CENTER, // starting position [lng, lat]
    style: 'mapbox://styles/mapbox/light-v11',
    zoom: 10.5, // starting zoom
    pitch: 50, // initial pitch
})

// add a navigation control at the bottom right corner
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// add a scale to the map
map.addControl(new mapboxgl.ScaleControl());

map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
    })
);


// map load
map.on('load', () => {
    // hide the load spinner when load complete
    document.getElementById("spinner").style.visibility = "hidden";
    
    map.resize();

    // prepare the source to be used by isochrone
    map.addSource('iso', {
        type: 'geojson',
        data: {
            'type': 'FeatureCollection',
            'features': []
        }
    });

    //data source of population overlay, from Mapbox
    map.addSource('population', {
        'type': 'vector',
        'url': 'mapbox://mapbox.660ui7x6'
    });

    //state population overlay
    map.addLayer(
        {
            'id': 'state-population',
            'source': 'population',
            'source-layer': 'state_county_population_2014_cen',
            'layout': {
                // Make the layer visible by default.
                'visibility': 'visible'
            },
            'maxzoom': zoomThreshold,
            'type': 'fill',
            // only include features for which the "isState"
            // property is "true"
            'filter': ['==', 'isState', true],
            'paint': {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'population'],
                    0,
                    '#ffffff',
                    500000,
                    '#f0f0f0',
                    750000,
                    '#d9d9d9',
                    1000000,
                    '#bdbdbd',
                    2500000,
                    '#969696',
                    5000000,
                    '#737373',
                    7500000,
                    '#525252',
                    10000000,
                    '#252525',
                    25000000,
                    '#000000'
                ],
                'fill-opacity': 0.4
            }
        },
        'road-label-simple' // Add layer below labels
    );

    //county population overlay
    map.addLayer(
        {
            'id': 'county-population',
            'source': 'population',
            'source-layer': 'state_county_population_2014_cen',
            'layout': {
                // Make the layer visible by default.
                'visibility': 'visible'
            },
            'minzoom': zoomThreshold,
            'type': 'fill',
            // only include features for which the "isCounty"
            // property is "true"
            'filter': ['==', 'isCounty', true],
            'paint': {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'population'],
                    0,
                    '#ffffff',
                    100,
                    '#f0f0f0',
                    1000,
                    '#d9d9d9',
                    5000,
                    '#bdbdbd',
                    10000,
                    '#969696',
                    50000,
                    '#737373',
                    100000,
                    '#525252',
                    500000,
                    '#252525',
                    1000000,
                    '#000000'
                ],
                'fill-opacity': 0.4
            }
        },
        'road-label-simple' // Add layer below labels
    );

    // toggle the visibility of the legends on zoom
    const stateLegendEl = document.getElementById('state-legend');
    const countyLegendEl = document.getElementById('county-legend');
    map.on('zoom', () => {
        // zoom away, legend for state population; zoom in, county population
        if (map.getZoom() > zoomThreshold) {
            stateLegendEl.style.display = 'none';
            countyLegendEl.style.display = 'block';
        } else {
            stateLegendEl.style.display = 'block';
            countyLegendEl.style.display = 'none';
        }
    });

    //iterate for the airport database
    airports.forEach(function (airport) {

        var type = airport.type
        var airportlat = airport.latitude_deg
        var airportlng = airport.longitude_deg
        var colour;
        var scales;
        //var utcDate = `${earthquakerecord.time}`;  // ISO-8601 formatted date returned from the original dataset
        //var localDate = moment(utcDate).format('LL'); // Display in local time, using the moment.js
        var coordinates = [airport.longitude_deg, airport.latitude_deg];
        var typeentry = null;

        //set the color of the markers
        // If it's an medium airport
        if (type === "medium_airport") {
            colour = "#659fa6";
            scales = 0.6;
            typeentry = "🧳 Medium Airport"

            // If it's a major airport
        } else if (type === "large_airport") {
            colour = "#0ac4ab";
            scales = 1.1;
            typeentry = "🛂 Major Airport"

            // If it's a small airport
        } else {
            colour = "#a6a6a6";
            scales = 0.4;
            typeentry = "🛩 Small Airport/Heliport"
        }

        //create popup incl. ap info and stick them on the markers on click
        const popup = new mapboxgl.Popup({
            offset: 40,
            anchor: 'bottom',
            /*
            closeButton: false,
            closeOnClick: false
            */
        }).setHTML(
            `<h3> ${typeentry} </h3><h4> <b> ✈ ${airport.name} </b> <br> Airport IATA code: <b>${airport.iata_code}</b> <br> Serving the city of <b>${airport.municipality}</b> </h4> `
        );

        //create the markers
        const marker = new mapboxgl.Marker({
            color: colour,
            scale: scales,
        })
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);
        const markerDiv = marker.getElement();

        /*
        markerDiv.addEventListener('mouseenter', () => marker.togglePopup());
        markerDiv.addEventListener('mouseleave', () => marker.togglePopup());
        */


        //get latlng of the airport on click and draw isochrone area
        markerDiv.addEventListener('click', () => {

            // remove other isochrone areas
            if (map.getLayer('isoLayer')) {
                map.removeLayer('isoLayer');
            }

            // get latlng
            var aplngLat = marker.getLngLat()

            // lock interaction while loading
            map.dragPan.disable();
            map.scrollZoom.disable();
            map.keyboard.disable();

            // pull out the load spinner
            document.getElementById("spinner").style.visibility = "visible";

            // read the airport coordinate
            var aplng = aplngLat['lng']
            var aplat = aplngLat['lat'];

            /* console.log(aplngLat['lat'])    //check that the coordinates being printed correctly, debug
            console.log(aplngLat['lng'])    //check that the coordinates being printed correctly
            */

            // Create a function that sets up the Isochrone API query then makes an fetch call
            async function getIso() {
                const query = await fetch(
                    `${urlBase}${profile}/${aplng},${aplat}?contours_minutes=${minutes}&polygons=true&denoise=0.5&access_token=${mapboxgl.accessToken}`,
                    { method: 'GET' }
                );
                const data = await query.json();
                /*
                console.log(data); //debug code to check the isochrone api response
                */
                map.getSource('iso').setData(data);
            }


            //draw the isochrone area
            map.addLayer(
                {
                    'id': 'isoLayer',
                    'type': 'fill',
                    'source': 'iso',
                    'layout': {},
                    'paint': {
                        'fill-color': '#3ebea3',
                        'fill-opacity': 0.7,  // default fill color transparency
                    }
                },
                'poi-label'
            );

            // remove existing popups
            const popups = document.getElementsByClassName("mapboxgl-popup");
            if (popups.length) {
                popups[0].remove();
            }

            // whenever the load finishes, do the rest
            map.once('sourcedataloading', () => {
                /*
                console.log('A sourcedataloading event occurred.'); //debug code detecting load complete
                */

                document.getElementById("spinner").style.visibility = "hidden"; // hide the loading spinner

                // enable interactions after load
                map.dragPan.enable();
                map.scrollZoom.enable();
                map.keyboard.enable();

                // finally, fly to the airport
                map.flyTo({
                    center: aplngLat,
                    zoom: 8.5,
                    pitch: 50,
                    essential: true,
                });
            });

            // Make the API call
            getIso();
        })

    })

    // Define the function of the zoom button 
    document.getElementById('fit').addEventListener('click', () => {
        // remove existing popups
        const popups = document.getElementsByClassName("mapboxgl-popup");
        if (popups.length) {
            popups[0].remove();
        }
        //reset camera position
        map.flyTo({
            zoom: 7.5,
            pitch: 50,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
        // clear existing isochrone area
        if (map.getLayer('isoLayer')) {
            map.removeLayer('isoLayer');
        }

    });


    // Define the function of the toggle population switch
    const checkbox = document.getElementById("slid");
    checkbox.addEventListener("change", () => {

        // Toggle the visibility status of population layers
        if (checkbox.checked == true) {
            map.setLayoutProperty('county-population', 'visibility', 'visible');
        } else {
            map.setLayoutProperty(
                'county-population',
                'visibility',
                'none'
            );
        };

        if (checkbox.checked == true) {
            map.setLayoutProperty('state-population', 'visibility', 'visible');
        } else {
            map.setLayoutProperty(
                'state-population',
                'visibility',
                'none'
            );
        };

        // Get the visibility status of the legend
        const stateLegendEl = document.getElementById('state-legend');
        const countyLegendEl = document.getElementById('county-legend');
        // Toggle the visibility status of the legend
        if (checkbox.checked == true) {
            countyLegendEl.style.visibility = 'visible';
        } else {
            countyLegendEl.style.visibility = 'hidden';
        };

        if (checkbox.checked == true) {
            stateLegendEl.style.visibility = 'visible';
        } else {
            stateLegendEl.style.visibility = 'hidden';
        };
    });

});
