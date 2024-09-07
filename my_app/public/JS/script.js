const socket = io();

        // Initialize the Leaflet map
        const map = L.map('map').setView([0, 0], 10);

        // Add the OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Shitsama - RealTracker',
            maxZoom: 18,
        }).addTo(map);

        // Store markers for each client
        const markers = {};

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;

                // Emit the location to the server
                socket.emit('send-location', { latitude, longitude });

                // Center the map on the user's location without resetting the zoom
                map.setView([latitude, longitude], map.getZoom());
            }, () => {
                alert("Unable to fetch location");
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            });
        } else {
            alert("Geolocation is not supported by your browser");
        }

        // Listen for location updates from other clients
        socket.on('receive-location', (data) => {
            const { id, latitude, longitude, color } = data;

            // Create custom marker icon with the unique color
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color:${color}; width: 20px; height: 20px; border-radius: 50%;"></div>`
            });

            // Update or create a marker for each client
            if (markers[id]) {
                markers[id].setLatLng([latitude, longitude]);
            } else {
                markers[id] = L.marker([latitude, longitude], { icon }).addTo(map);
            }
        });

        // Remove the marker when a client disconnects
        socket.on('user-disconnected', (id) => {
            if (markers[id]) {
                map.removeLayer(markers[id]);
                delete markers[id];
            }
        });