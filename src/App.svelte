<script>
	import Header from './Header.svelte';
	import Viewer from './Viewer.svelte';
	import Popup from './Popup.svelte';
</script>

<main>
	<Header />
	<Viewer />
	<Popup />
</main>

<style>
	:global(html, body) {
  	overflow: hidden;
  	background-color: #0a0a0a;
	}
	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		min-height: 100%;
	}
</style>
