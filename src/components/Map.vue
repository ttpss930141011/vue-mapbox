<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted, onUnmounted} from 'vue';
import mapboxgl from 'mapbox-gl';

// Access token for Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

// Props
interface MapProps {
  lng: number;
  lat: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

const props = defineProps<{ modelValue: MapProps }>();
const emit = defineEmits<{
  update: (value: MapProps) => void;
}>()

// References and reactive variables
const mapContainer = ref<HTMLDivElement | null>(null);
let map: mapboxgl.Map | null = null;

// Function to get the current map location
const getLocation = () => {
  if (map) {
    const {lng, lat} = map.getCenter();
    return {
      lng,
      lat,
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      zoom: map.getZoom(),
    };
  }
  return {...props.modelValue};
};

// Watcher to handle prop changes
watch(
    () => props.modelValue,
    (next) => {
      if (map) {
        const curr = getLocation();

        if (curr.lng !== next.lng || curr.lat !== next.lat) {
          map.setCenter([next.lng, next.lat]);
        }
        if (curr.pitch !== next.pitch) {
          map.setPitch(next.pitch);
        }
        if (curr.bearing !== next.bearing) {
          map.setBearing(next.bearing);
        }
        if (curr.zoom !== next.zoom) {
          map.setZoom(next.zoom);
        }
      }
    }
);

// Lifecycle hook: mounted
onMounted(() => {
  const {lng, lat, zoom, bearing, pitch} = props.modelValue;

  map = new mapboxgl.Map({
    container: mapContainer.value as HTMLElement,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    bearing,
    pitch,
    zoom,
  });

  // Emit updates to parent component when the map is moved or zoomed
  const updateLocation = () => emit('update', getLocation());

  map.on('move', updateLocation);
  map.on('zoom', updateLocation);
  map.on('rotate', updateLocation);
  map.on('pitch', updateLocation);
});

// Lifecycle hook: unmounted
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style>
.map-container {
  flex: 1;
}
</style>
