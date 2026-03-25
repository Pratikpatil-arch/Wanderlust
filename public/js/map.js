function initializeMap(mapStyle = "Standard", colorScheme = "Dark") {
    const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${API_KEY}&color-scheme=${colorScheme}`;
    const map = new maplibregl.Map({
        container: 'map',                   // The ID of the map container
        style: styleUrl,                    // The style URL for the map
        center:listing.geometry.coordinates,   // Starting center coordinates
        zoom: 13,                           // Initial zoom level
        validateStyle: false                // Disable style validation
    });
    return map;                             // Return the initialized map
}

const map = initializeMap("Standard", "Light");

// Add navigation controls
map.addControl(new maplibregl.NavigationControl());

// Add your listing marker after map loads
map.on('load', () => {
   if (typeof listing.geometry.coordinates !== 'undefined' && listing.geometry.coordinates.length === 2) {
    const marker = new maplibregl.Marker({ color: "red" })
        .setLngLat(listing.geometry.coordinates) // now this works because it's an array [lng, lat]
        .setPopup(
        new maplibregl.Popup({ offset: 25, closeButton: true }) // Popup settings
            .setHTML(`
                <div style="
                    padding: 10px; 
                    font-family: Arial, sans-serif; 
                    font-size: 14px; 
                    color: #333; 
                    background-color: #fff; 
                    border-radius: 8px; 
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                "><h4>${listing.location}</h4><p>Exact location will be provided after booking!</p>
                </div>
            `)
    )
        .addTo(map);

    map.setCenter(coordinates);
    map.setZoom(10);
}
});

// GeoPlaces setup (search box / reverse geocode)
const geoPlaces = getGeoPlaces(map);
addMapClick(map, geoPlaces);


/**
 * Gets a GeoPlaces instance for Places operations.
 */
function getGeoPlaces(map) {
    const authHelper = amazonLocationClient.withAPIKey(API_KEY, AWS_REGION);                      // Authenticate using the API key and AWS region
    const locationClient = new amazonLocationClient.GeoPlacesClient(authHelper.getClientConfig()); // Create a GeoPlaces client
    const geoPlaces = new GeoPlaces(locationClient, map);                                          // Create GeoPlaces instance
    return geoPlaces;                                                                          // Return the GeoPlaces instance
}

/**
* Adds search box to the map.
*/




/**
 * Renders the popup content for a given feature.
 */
function renderPopup(feature) {
    return `
                <div class="popup-content">
                    <span class="${feature.place_type.toLowerCase()} badge">${feature.place_type}</span><br>
                    ${feature.place_name}
                </div>`;
}

/**
 * Creates a popup for a given feature and sets its position.
 */
function createPopup(feature) {
    return new maplibregl.Popup({ offset: 30 })      // Create a new popup
        .setLngLat(feature.geometry.coordinates)     // Set the popup position
        .setHTML(renderPopup(feature));              // Set the popup content
}

/**
 * Sets up reverse geocoding on map click events.
 */
function addMapClick(map, geoPlaces) {
    map.on('click', async ({ lngLat }) => {                     // Listen for click events on the map
        const response = await geoPlaces.reverseGeocode({ query: [lngLat.lng, lngLat.lat], limit: 1, click: true }); // Perform reverse geocoding

        if (response.features.length) {                         // If there are results
            const clickMarker = new maplibregl.Marker({ color: "orange" }); // Create a marker
            const feature = response.features[0];               // Get the clicked feature
            const clickedPopup = createPopup(feature);          // Create popup for the clicked feature
            clickMarker.setLngLat(feature.geometry.coordinates) // Set marker position
                .setPopup(clickedPopup)                         // Attach popup to marker
                .addTo(map);                                    // Add marker to the map

            clickedPopup.on('close', () => clickMarker.remove()).addTo(map); // Remove marker when popup is closed
        }
    });
}
