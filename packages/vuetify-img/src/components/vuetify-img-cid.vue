<template>
  <img :src="thumbURL" ref="img" v-bind="$props"/>
<!--	<v-img ref="img" :src="thumbURL" v-if="thumbURL" v-bind="$props" @error="thumbErr">-->
<!--    <template #placeholder>-->
<!--      <slot v-if="generateErr" name="failed" />-->
<!--      <slot v-else name="placeholder" >-->
<!--        <v-row class="fill-height ma-0" align="center" justify="center">-->
<!--          <v-progress-circular indeterminate />-->
<!--        </v-row>-->
<!--      </slot>-->
<!--    </template>-->

<!--    <template #failed>-->
<!--      <slot name="failed" >-->
<!--        <v-row class="fill-height ma-0" align="center" justify="center">-->
<!--          <v-icon color="grey" size="large" :icon="mdiRobotDead" />-->
<!--        </v-row>-->
<!--      </slot>-->
<!--    </template>-->

<!--    <template #default>-->
<!--      <slot name="default" />-->
<!--    </template>-->
<!--  </v-img>-->
</template>

<script>
import { cid as isCID } from "is-ipfs";
import { DefaultConfig, IPNSThumbnailURL, GenerateThumbnailURL } from "nyats-client";

const config = {
  endpoint: import.meta.env.VITE_NYATS_API || DefaultConfig.endpoint,
  gatewayURL: import.meta.env.VITE_NYATS_IPFS_GATEWAY || DefaultConfig.gatewayURL,
  ipnsRoot: import.meta.env.VITE_NYATS_IPNS_ROOT || DefaultConfig.ipnsRoot,
};

export default {
  props: {
    cid: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: "",
    },
    height: {
      type: Number,
      required: false,
      default: 100,
    },
    width: {
      type: Number,
      required: false,
      default: 100,
    },
  },
  data: () => ({
    ipnsErr: false,
    generateErr: false,
    thumbHeight: 0,
    thumbWidth: 0,
  }),
  mounted() {
    this.updateSize();
  },
  updated() {
    this.updateSize();
  },
  computed: {
    thumbURL() {
      if (this.thumbWidth && this.thumbHeight) {
        if(!isCID(this.cid)) return ""
        if (this.ipnsErr) {
          console.debug("Generating new thumbnail", this);
          return GenerateThumbnailURL(
            this.cid,
            this.thumbWidth,
            this.thumbHeight,
            this.type,
            config
          );
        }

        console.debug("Attempting to load IPNS thumbail", this);
        console.log(this.cid, this.thumbWidth, this.thumbHeight, config);

        return IPNSThumbnailURL(this.cid, this.thumbWidth, this.thumbHeight, config);
      } else {
        console.warn("No thumbnail dimensions known, not returning URL.", this);
        return "";
      }
    },
  },
  methods: {
    updateSize() {
      const clientHeight = this.$refs.img?.clientHeight;
      const clientWidth = this.$refs.img?.clientWidth;

      if (this.height) {
        this.thumbHeight = this.height;
        console.debug("Setting prop height:", this.thumbHeight, this);
      } else if (clientHeight) {
        this.thumbHeight = clientHeight;
        console.debug("Using client height:", this.thumbHeight, this);
      } else {
        console.debug("Neither height nor el set.", this);
      }

      if (this.width) {
        this.thumbWidth = this.width;
        console.debug("Setting prop width:", this.thumbWidth, this);
      } else if (clientWidth) {
        this.thumbWidth = clientWidth;
        console.debug("Using client width:", this.thumbWidth, this);
      } else {
        console.debug("Neither width nor el set.", this);
      }
    },
    thumbErr() {
      if (this.ipnsErr) {
        this.generateErr = true;
      } else {
        this.ipnsErr = true;
      }
    },
  },
};
</script>
