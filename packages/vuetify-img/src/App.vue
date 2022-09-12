<script setup>
import { ref } from "vue";
import { cid as isCID } from "is-ipfs";
import VImgCID from "./components/vuetify-img-cid.vue";

const initialCid = "bafybeidovjdvuarzq2mldmvudhccenl4e4rm2bvhqzjye2fpksm2ifjuge";
let cid = ref(initialCid);
let formCid = ref(initialCid);
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
            <v-text-field
              label="CID"
              v-model="cid"
              :rules="[(v) => isCID(v) || 'Enter valid CID.']"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card elevation="2">
              <v-card-title>100px width, 100px height</v-card-title>
              <VImgCID :cid="cid" :width="100" :height="100" type="image" aspect-ratio="1">
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
              <v-card-title>200px width, aspect-ratio 2</v-card-title>
              <VImgCID :cid="cid" :width="200" aspect-ratio="2">
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

<script>
export default {
  methods: {
    formChange(v) {
      if (isCID(v)) {
        this.cid = v;
      }
    },
  },
};
</script>
