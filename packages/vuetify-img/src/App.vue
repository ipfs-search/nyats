<script setup>
import { ref } from "vue";
import VImgCID from "./components/vuetify-img-cid.vue";

let cid = ref("QmbStTMnunBtT2fhVRPHaq1TLCD1DftUJ8h6dxvoNCqSB6");
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="fill-height fluid">
        <v-row>
          <v-col>
            <h1>nyats-vuetify-img demo</h1>
            <p>
              Vue3/<a href="https://next.vuetifyjs.com/">Vuetify3</a> thumbnailing component, based
              on <a href="https://next.vuetifyjs.com/en/components/images/">v-img</a>, rendering
              thumbnails for IPFS CID's using IPNS for caching and nyats API as fallback.
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field label="CID" placeholder="CID" v-model="cid"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card elevation="2">
              <v-card-title>100px width, aspect-ratio 1</v-card-title>
              <VImgCID :cid="cid" :width="100" type="image" aspect-ratio="1">
                <template #placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate />
                  </v-row>
                </template>

                <template #failed>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-icon color="grey" size="large" :icon="mdiRobotDead" />
                  </v-row>
                </template>
              </VImgCID>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card elevation="2">
              <v-card-title>100px width, aspect-ratio 2</v-card-title>
              <VImgCID :cid="cid" :width="100" aspect-ratio="2">
                <template #placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate />
                  </v-row>
                </template>

                <template #failed>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-icon color="grey" size="large" :icon="mdiRobotDead" />
                  </v-row>
                </template>
              </VImgCID>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card elevation="2">
              <v-card-title>Fluid</v-card-title>
              <VImgCID :cid="cid" aspect-ratio="1">
                <template #placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate />
                  </v-row>
                </template>

                <template #failed>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-icon color="grey" size="large" :icon="mdiRobotDead" />
                  </v-row>
                </template>
              </VImgCID>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
