<template>
  <div ref="mapContainer" class="map-container"></div>
  <InfoPanel :building="selectedBuilding" :timelineEvents="timelineEvents"/>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {MapProps} from "../types";
import InfoPanel from './InfoPanel.vue';
import {generateRandomBuildingData, generateRandomTimelineEvents} from "../utils";

// Access token for Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

const props = defineProps<{ modelValue: MapProps }>();
const emit = defineEmits<{
  update: (value: MapProps) => void;
}>();

// References and reactive variables
const mapContainer = ref<HTMLDivElement | null>(null);
const map = ref<mapboxgl.Map | null>(null);
const geoCoder = ref<mapboxgl.Geocoder | null>(null);
const hoverBuildingId = ref(null);
const popup = ref<mapboxgl.Popup | null>(null);
const selectedBuilding = ref<any>(null);

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
const timelineEvents = ref(generateRandomTimelineEvents());

// Watcher to handle prop changes to emit the update event
watch(
    () => props.modelValue,
    (value) => {
      if (map.value) {
        const curr = getLocation();

        if (curr.lng !== value.lng || curr.lat !== value.lat) {
          map.value.setCenter([value.lng, value.lat]);
        }
        if (curr.pitch !== value.pitch) {
          map.value.setPitch(value.pitch);
        }
        if (curr.bearing !== value.bearing) {
          map.value.setBearing(value.bearing);
        }
        if (curr.zoom !== value.zoom) {
          map.value.setZoom(value.zoom);
        }
      }
    }
);

// Watcher to handle hover building state to paint or dis-paint the building
watch(hoverBuildingId, (newId, oldId) => {
  if (oldId !== null) {
    // clean up the old hover building state
    map.value.getCanvas().style.cursor = 'default';
    map.value.setFeatureState(
        {source: 'composite', sourceLayer: 'building', id: oldId},
        {hover: false}
    );
    if (popup.value) {
      popup.value.remove();
      popup.value = null;
    }
  }
  if (newId !== null) {
    // set the new hover building state
    map.value.getCanvas().style.cursor = 'pointer';
    map.value.setFeatureState(
        {source: 'composite', sourceLayer: 'building', id: newId},
        {hover: true}
    );
  }
});

// Lifecycle hook: mounted
onMounted(() => {
  const {lng, lat, zoom, bearing, pitch} = props.modelValue;

  map.value = new mapboxgl.Map({
    container: mapContainer.value as HTMLElement,
    style: 'mapbox://styles/mapbox/streets-v12',
    // style: 'mapbox://styles/mapbox/light-v11',
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
        // Draw an arrow value to the location dot to indicate which direction the device is heading.
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
    map.value.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'type': 'fill-extrusion',
      'minzoom': 14,
      'paint': {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#ff0000',
          '#ddd'
        ],
        'fill-extrusion-height': ["number", ["get", "height"], 5],
        'fill-extrusion-base': ["number", ["get", "min_height"], 0],
        'fill-extrusion-opacity': 1
      }
    }, labelLayerId);

    map.value.on('click', function (e) {
      var features = map.value.queryRenderedFeatures(e.point, {
        layers: ['3d-buildings']
      });
      if (features[0]) {
        const randomBuildingData = generateRandomBuildingData();
        selectedBuilding.value = {
          id: features[0].id,
          name: features[0].properties.name || 'Unknown',
          ...randomBuildingData
        };
        timelineEvents.value = generateRandomTimelineEvents();
      }
    });

    map.value.on('mousemove', function (e) {
      var features = map.value.queryRenderedFeatures(e.point, {
        layers: ['3d-buildings']
      });
      if (features[0]) {
        hoverBuildingId.value = features[0].id;

        // Create a popup if it doesn't exist
        if (!popup.value) {
          popup.value = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
          });
        }

        // Set the popup content and location
        popup.value
            .setLngLat(e.lngLat)
            .setHTML(`<strong>Building ID:</strong> ${features[0].id}`)
            .addTo(map.value);
      } else {
        hoverBuildingId.value = null;
      }
    });
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
