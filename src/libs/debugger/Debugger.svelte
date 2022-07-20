<script lang="ts">
const openDebugger = () => {
  window.open("/_debugger", "debugger", "width=1200,height=1200,left=800")
}
</script>

<div class="layer(bottom+left)">
  <button on:click={openDebugger}>debug</button>
</div>