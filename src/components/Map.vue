<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {MapProps} from "../types";

// Access token for Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;


const props = defineProps<{ modelValue: MapProps }>();
const emit = defineEmits<{
  update: (value: MapProps) => void;
}>()

// References and reactive variables
const mapContainer = ref<HTMLDivElement | null>(null);
const map = ref<mapboxgl.Map | null>(null);
const geoCoder = ref<mapboxgl.Geocoder | null>(null);

// Function to get the current map location
const getLocation = () => {
  if (map.value) {
    const {lng, lat} = map.value.getCenter();
    return {
      lng,
      lat,
      bearing: map.value.getBearing(),
      pitch: map.value.getPitch(),
      zoom: map.value.getZoom(),
    };
  }
  return {...props.modelValue};
};
const updateLocation = () => emit('update', getLocation());


// Watcher to handle prop changes
watch(
    () => props.modelValue,
    (next) => {
      if (map.value) {
        const curr = getLocation();

        if (curr.lng !== next.lng || curr.lat !== next.lat) {
          map.value.setCenter([next.lng, next.lat]);
        }
        if (curr.pitch !== next.pitch) {
          map.value.setPitch(next.pitch);
        }
        if (curr.bearing !== next.bearing) {
          map.value.setBearing(next.bearing);
        }
        if (curr.zoom !== next.zoom) {
          map.value.setZoom(next.zoom);
        }
      }
    }
);


// Lifecycle hook: mounted
onMounted(() => {
  const {lng, lat, zoom, bearing, pitch} = props.modelValue;

  map.value = new mapboxgl.Map({
    container: mapContainer.value as HTMLElement,
    // style: 'mapbox://styles/mapbox/streets-v12',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [lng, lat],
    bearing,
    pitch,
    zoom,
  });

  map.value.on('move', updateLocation);
  map.value.on('zoom', updateLocation);
  map.value.on('rotate', updateLocation);
  map.value.on('pitch', updateLocation);


  geoCoder.value = new MapboxGeocoder({
    // Initialize the geocoder
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: false // Do not use the default marker style
  });

// Add the geocoder to the map
  map.value.addControl(geoCoder.value);
// Add geolocate control to the map.
  map.value.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
        fitBoundsOptions: {
          zoom: 16
        }
      })
  );

  map.value.on('style.load', () => {
    // Insert the layer beneath any symbol layer.
    const layers = map.value.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;

    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.value.addLayer(
        {
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',

            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
    );
  });
});

// Lifecycle hook: unmounted
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});
</script>

<style>
.map-container {
  flex: 1;
}
</style>
