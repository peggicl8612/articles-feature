<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1>歡迎來到咪凹屋</h1>
        </v-col>
      </v-row>
    </v-container>

    <carousel :per-page="1">
      <slide><img class="carousel1" src="https://picsum.photos/800/600/?random=10" /></slide>
      <slide><img class="carousel2" src="https://picsum.photos/800/600/?random=11" /></slide>
    </carousel>
  </div>
</template>

<script setup></script>

<style scoped>
h1 {
  color: #e8b4b8;
}

.carousel {
  display: block;
  width: 100%;
}

.carousel-slide img {
  width: 100%;
  height: auto;
}
</style>
