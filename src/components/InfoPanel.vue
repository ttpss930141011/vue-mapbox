<template>
  <el-card class="info-panel" shadow="hover" v-if="building">
    <h3>Building Details</h3>
    <el-descriptions column="1" border>
      <el-descriptions-item label="ID">{{ building.id }}</el-descriptions-item>
      <el-descriptions-item label="Name">{{ building.name || 'N/A' }}</el-descriptions-item>
      <el-descriptions-item label="Type">{{ building.type }}</el-descriptions-item>
      <el-descriptions-item label="Year Built">{{ building.yearBuilt }}</el-descriptions-item>
      <el-descriptions-item label="Area">{{ building.area }} sqm</el-descriptions-item>
      <el-descriptions-item label="Market Price">{{ building.marketPrice }} USD</el-descriptions-item>
      <el-descriptions-item label="Rent">{{ building.rent }} USD/month</el-descriptions-item>
    </el-descriptions>
    <h4>Timeline</h4>
    <el-timeline>
      <el-timeline-item v-for="(event, index) in timelineEvents" :key="index" :timestamp="event.date">
        {{ event.content }}
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Building {
  id: string;
  name?: string;
  type: string;
  yearBuilt: number;
  area: number;
  marketPrice: number;
  rent: number;
}

interface TimelineEvent {
  date: string;
  content: string;
}

const props = defineProps<{
  building: Building | null;
  timelineEvents: TimelineEvent[];
}>();
</script>

<style>
.info-panel {
  position: fixed;
  top: 80px;
  left: 16px;
  width: 300px;
  z-index: 1000;
}
</style>
