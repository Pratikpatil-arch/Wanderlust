module.exports.geocodePlace = async (place) => {

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "wanderlust-app"
        }
    });

    const data = await response.json();

    if (data.length > 0) {
        return {
            type: "Point",
            coordinates: [
                parseFloat(data[0].lon),
                parseFloat(data[0].lat)
            ]
        };
    }

    return null;
}