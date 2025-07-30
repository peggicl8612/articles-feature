<template>
  <div>
    <v-container class="container">
      <v-row>
        <v-col cols="12"> </v-col>
      </v-row>
    </v-container>

    <carousel :per-page="1">
      <h1>歡迎來到咪凹屋</h1>
      <slide><img class="carousel-1" src="../assets/bg-1.jpg" /></slide>
      <!-- <slide><img class="carousel-2" src="../assets/bg.jpeg" /></slide>
      <slide><img class="carousel-3" src="../assets/bg.jpeg" /></slide>
      <slide><img class="carousel-4" src="../assets/bg.jpeg" /></slide> -->
    </carousel>
  </div>
</template>

<script setup></script>

<style scoped>
.container {
  position: relative;
}
h1 {
  position: absolute;
  color: #49486258;
  z-index: 1;
  width: 100%;
  text-align: center;
  padding: 10px;
}

.carousel-1 {
  display: inline-block;
  width: 100vw;
  z-index: 0;
  opacity: 0.6;
}
</style>
