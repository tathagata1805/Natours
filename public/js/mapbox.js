/* eslint-disable */

// CONFIGURING MAPBOX
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGF0aGFnYXRhMTgwNSIsImEiOiJja3N2eXhkMDMxdWxuMnduMWxzc3JicnRrIn0.bdK-p33bBGeU0INC655enw';
  const map = new mapboxgl.Map({
    container: 'map', // CONTAINER ID
    style: 'mapbox://styles/mapbox/light-v10', // STYLE URL
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // CREATE MARKER
    const el = document.createElement('div');
    el.className = 'marker';

    // ADD MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD POPUP
    new mapboxgl.Popup({
      offset: 30,
    })
      // ADDING POINT NAMES IN THE MARKER
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // EXTEND MAPBOUNDS TO INCLUDE CURRENT LOCATION
    bounds.extend(loc.coordinates);
  });

  // MANUAL STYLING TO STOP OVERLAP OF LOCATION
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
