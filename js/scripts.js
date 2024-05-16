// Define some variables, including location
var STARTING_CENTER = [-73.26651, 40.79090]
var ZOOM_SW = [-74.87235, 40.19620]
var ZOOM_NE = [-71.66068, 41.38031]
var hoveredPolygonId = null;
// Variables for isochrone
var aplngLat = null;
var aplng = 0;
var aplat = 0;
// Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
const profile = 'driving'; // Set the default routing profile
const minutes = 60; // Set the default duration


// Set max zoom out bounds to the US *********
const bounds = [
    [-144.75460, 10.14845], // Southwest coordinates
    [-44.18682, 60.65736] // Northeast coordinates
];

// Introduce the map
mapboxgl.accessToken = 'pk.eyJ1IjoidGlhbnlzb25nIiwiYSI6ImNsdWx1OGVodzBqcWwyaW9hOW1oaWRnOWwifQ.E4RNl8ESZulQlGSzXECAMw';
const map = new mapboxgl.Map({
    container: 'container', // container ID
    center: STARTING_CENTER, // starting position [lng, lat]
    style: 'mapbox://styles/mapbox/outdoors-v12',
    zoom: 6.13, // starting zoom
    maxBounds: bounds // Set the map's geographical boundaries
})

// add a navigation control at the bottom right corner
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// search box needed

// add a scale to the map
map.addControl(new mapboxgl.ScaleControl());

// map load
map.on('load', () => {
    map.resize();

    // set css size based on scale *********
    var scales = map.getZoom() / 10;

    // prepare the source to be used by isochrone
    map.addSource('iso', {
        type: 'geojson',
        data: {
          'type': 'FeatureCollection',
          'features': []
        }
      });

    // draw the states
    map.addSource('states', {
        "type": "geojson",
        "data": "data/us_states.geojson"
    }); 

    // add a fill layer to the states
    /* map.addLayer({
        'id': 'states-fill',
        'type': 'fill',
        'source': 'states',
        'layout': {},
        'paint': {
            'fill-color': { // data-driven color styling
                property: 'count',
                stops: [[0, '#fff'], [12000, '#f00']] // earthquake count from 0 to 12000, color from #fff to #f00 
            },
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1, // fill color transparency if hovered
                0.7  // default fill color transparency
            ]
        }
    });
    */

    /*add a line layer for the states
    map.addLayer({
        'id': 'states-line',
        'type': 'line',
        'source': 'states',
        'layout': {},
        'paint': {
            'line-color': '#000',
            'line-width': 1.5
        }
    }, 'path-pedestrian-label');
    */

    /*
    // When the user moves their mouse over the state-fill layer, update the feature state for the feature under the mouse.
    map.on('mousemove', 'states-fill', (e) => {
        if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: 'states', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = e.features[0].id;
            map.setFeatureState(
                { source: 'states', id: hoveredPolygonId },
                { hover: true }
            );
        }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    map.on('mouseleave', 'states-fill', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState(
                { source: 'states', id: hoveredPolygonId },
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    });
    */

    //iterate
    airports.forEach(function (airport) {

        var type = airport.type;
        var colour;
        //var utcDate = `${earthquakerecord.time}`;  // ISO-8601 formatted date returned from the original dataset
        //var localDate = moment(utcDate).format('LL'); // Display in local time, using the moment.js
        var coordinates = [airport.longitude_deg, airport.latitude_deg];

        //set the color of the markers
        // If it's an medium airport
        if (type === "medium_airport") {
            colour = "orange";

            // If it's a major airport
        } else if (type === "large_airport") {
            colour = "red";

            // If it's a small airport
        } else {
            colour = "grey";
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
            `<h3> Airport </h3><h4> <b> ${airport.name} </b> </h4>`
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
            //get latlng
            var aplngLat = marker.getLngLat()
            var aplng = aplngLat['lng']
            console.log(aplngLat['lat'])    //check that the coordinates being printed correctly
            console.log(aplngLat['lng'])    //check that the coordinates being printed correctly
            var aplat = aplngLat['lat'];
            // Create a function that sets up the Isochrone API query then makes an fetch call
            async function getIso() {
                const query = await fetch(
                    `${urlBase}${profile}/${aplng},${aplat}?contours_minutes=${minutes}&polygons=true&denoise=0.5&access_token=${mapboxgl.accessToken}`,
                    { method: 'GET' }
                );
                const data = await query.json();
                console.log(data);            
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
                    'fill-color': '#5a3fc0',
                    'fill-opacity': 0.3
                  }
                },
                'poi-label'
              );
        
              // Make the API call
              getIso();

        })
    })



    /* Define the function of the zoom button */
    document.getElementById('fit').addEventListener('click', () => {
        map.fitBounds([
            ZOOM_SW, // southwestern corner of the bounds
            ZOOM_NE // northeastern corner of the bounds
        ]);
    });

    // When a click event occurs on a feature in the states layer,
    // open a popup at the location of the click, with description
    // HTML from the click event's properties
    map.on('click', 'states-fill', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3> State profile: </h3><h4> In <b> ${e.features[0].properties.name} </b>, <b>${e.features[0].properties.count}</b> earthquakes happened during 1638 to 1985. </h4>`)
            .addTo(map);
    });

    /*map.on('click', 'states-fill', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3> State profile: </h3><h4> In <b> ${e.features[0].properties.name} </b>, <b>${e.features[0].properties.count}</b> earthquakes happened during 1638 to 1985. </h4>`)
            .addTo(map);
    });
    */

    // Change the cursor to a pointer when
    // the mouse is over the states layer
    map.on('mouseenter', 'states-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change the cursor back to a pointer
    // when it leaves the states layer
    map.on('mouseleave', 'states-fill', () => {
        map.getCanvas().style.cursor = '';
    });

});
