module.exports.geocodePlace=async(place)=>{



    const AWS_REGION="ap-southeast-2";
    const ALS_KEY="v1.public.eyJqdGkiOiI2Yjg0MmExZi0xNWNiLTQ3MDgtYTBhZi1mNDRhMDg0OWYwYmQifTz3Jht7rFqLsnBgPib5v8JsaKrmE1vcg-4KBru8q_yclW-7v1RRM3LY3lNJsQvtwkcmi3VNNz5qaZGM3hpI3E4SEEkuZp0MdWlpPfE9R-aqi_9Eeat5zJFB2Jq3mB0wdYFwpUqV6Qta6CdpN4oeocOcy0YpCHY4m9Mp_tNfEX1R1aBsy4hNSM4sYzHTZqs94Fu46_Z8CfqHsYG7E7vE36KyHTPGJ9MDBExv3Xq8zQrBb3kbOkitTlAWhREDoNI7czl6uRhu0eiiTpuSieB9SJv11QpDPTquYgCIii31Bf7v9OTTyUQi10-BOi0pngHXYwG9v74rCQ1v8XW3qKZpsjA.ZTA2OTdiZTItNzgyYy00YWI5LWFmODQtZjdkYmJkODNkMmFh";
    
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

