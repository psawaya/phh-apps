<script>
  import { AppInterface } from './AppInterface'
  import App from './App.svelte'

  const appInterface = new AppInterface()
  let loaded = false

  function handleAnnouncement() {
    var message = prompt('Make an announcement', '')
    if (message) {
      appInterface.announce(message)
    }
  }
  appInterface.onLoad((state) => {
    loaded = true
  })
</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
  <div>
    <button on:click={handleAnnouncement}>Speak</button>
  </div>
{/if}
