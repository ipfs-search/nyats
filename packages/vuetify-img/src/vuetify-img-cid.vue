<script setup>
defineProps({
	cid: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: false,
		default: null,
	},
});
</script>

<template>
	<v-img ref="img" :src="thumbURL()" v-bind="$attrs" @error="thumbErr()">
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
import { defaultConfig, IPNSThumbnailURL, GenerateThumbnailURL } from "nyats-client";

const config = {
	endpoint: import.meta.env.VITE_NYATS_API || defaultConfig.endpoint,
	gatewayURL: import.meta.env.VITE_NYATS_IPFS_GATEWAY || defaultConfig.gatewayURL,
	ipnsRoot: import.meta.env.VITE_NYATS_IPNS_ROOT || defaultConfig.ipnsRoot,
};

export default {
	data: () => ({
		ipnsErr: false,
		generateErr: false,
		width: null,
		height: null,
	}),
	mounted() {
		this.updateSize(this.$refs.img);
	},
	updated() {
		this.updateSize(this.$refs.img);
	},
	methods: {
		updateSize(el) {
			if (el) {
				this.height = el.$el.clientHeight;
				this.width = el.$el.clientHeight;
			}
		},
		thumbErr() {
			if (this.ipnsErr) {
				this.generateErr = true;
			} else {
				this.ipnsErr = true;
			}
		},
		thumbURL() {
			if (this.width && this.height) {
				if (this.ipnsErr) {
					return GenerateThumbnailURL(this.cid, this.width, this.height, this.type, config);
				}

				return IPNSThumbnailURL(this.cid, this.width, this.height, config);
			}
		},
	},
};
</script>
