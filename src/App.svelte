<script>
  import Announcement from "./Announcement.svelte";
  import Icebreaker from "./Icebreaker.svelte";
  import TV from "./Tv.svelte";
  import { AppInterface } from "./AppInterface";

  const urlParams = new URLSearchParams(window.location.search);

  let appName = "";
  if (urlParams.get("appName")) {
    appName = urlParams.get("appName");
  } else {
    throw new Error("appName param missing!");
  }

  export let url = "";
</script>

{#if appName === 'icebreaker'}
  <Icebreaker />
{:else if appName === 'tv'}
  <TV />
{:else if appName === 'announcement'}
  <Announcement />
{/if}
