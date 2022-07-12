<script>
  import Announcement from "./Announcement.svelte";
  import Icebreaker from "./Icebreaker.svelte";
  import TV from "./Tv.svelte";
  import Cards from "./Cards.svelte";
  import Blackjack from "./Blackjack.svelte";
  import Madlibs from "./madlibs/MadlibsMain.svelte";
  import Music from "./Music.svelte";
  import Harness from "./Harness.svelte";
  import { AppInterface } from "./AppInterface";

  const urlParams = new URLSearchParams(window.location.search);

  let appName = "";
  if (urlParams.get("appName")) {
    appName = urlParams.get("appName");
  }

  export let url = "";
</script>

{#if appName === 'icebreaker'}
  <Icebreaker />
{:else if appName === 'tv'}
  <TV />
{:else if appName === 'announcement'}
  <Announcement />
{:else if appName === 'cards'}
  <Cards />
{:else if appName === 'blackjack'}
  <Blackjack />
{:else if appName === 'madlibs'}
  <Madlibs />
{:else if appName === 'music'}
  <Music />
{:else}
  <Harness />
{/if}
