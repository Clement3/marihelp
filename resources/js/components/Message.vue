<template>
	<article class="message is-danger" v-if="message.length">
		<div class="message-body">
			{{ message }}
		</div>
	</article>
</template>

<script>
export default {
	props: {
		message: String,
	}
}
</script>
