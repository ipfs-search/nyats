<script setup>
defineProps({
	cid: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: false,
	},
	height: {
		type: Number,
		required: false,
	},
	width: {
		type: Number,
		required: false,
	},
});
</script>

<template>
	<v-img ref="img" :src="thumbURL" v-bind="$props" @error="thumbErr">
		<template #placeholder>
			<slot v-if="generateErr" name="failed" />
			<slot v-else name="placeholder" />
		</template>

		<template #failed> <slot name="failed" /> </template>

		<template #default>
			<slot name="default" />
		</template>
	</v-img>
</template>

<script>
import { DefaultConfig, IPNSThumbnailURL, GenerateThumbnailURL } from "nyats-client";

const config = {
	endpoint: import.meta.env.VITE_NYATS_API || DefaultConfig.endpoint,
	gatewayURL: import.meta.env.VITE_NYATS_IPFS_GATEWAY || DefaultConfig.gatewayURL,
	ipnsRoot: import.meta.env.VITE_NYATS_IPNS_ROOT || DefaultConfig.ipnsRoot,
};

export default {
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
			const clientHeight = this.$refs.img?.$el.clientHeight;
			const clientWidth = this.$refs.img?.$el.clientWidth;

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
