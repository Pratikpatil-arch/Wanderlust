if (listing.geometry && listing.geometry.coordinates) {

    const coordinates = listing.geometry.coordinates;

    const map = L.map("map").setView(
        [coordinates[1], coordinates[0]],
        13
    );

   L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 20
}).addTo(map);

    const redIcon = L.divIcon({
    className: "custom-marker",
    html: '<i class="fa-solid fa-location-dot"></i>',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40]
});

    L.marker([coordinates[1], coordinates[0]], {
        icon: redIcon
    })
    .addTo(map)
    .bindPopup(`
        <h5>${listing.location}</h5>
        <p>Exact location will be provided after booking!</p>
    `)
    .openPopup();
}