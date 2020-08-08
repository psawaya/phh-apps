<script>
  import { AppInterface } from "./AppInterface";

  import _ from "lodash";
  import Youtube from "./Youtube.svelte";

  const appInterface = new AppInterface();

  let loaded = false;
  let state = {
    videoId: "",
    playing: false,
  };
  let player = null;
  let videoIdInput = "RYlCVwxoL_g";

  function onVideoStateChange({ detail }) {
    if (state.playing) {
      // 2 is the paused state, see https://developers.google.com/youtube/iframe_api_reference#Playback_controls
      if (detail === 2 || detail === -1) {
        appInterface.update("playing", false);
        state.playing = false;
      }
    } else {
      if (detail === 1) {
        appInterface.update("playing", true);
        state.playing = true;
      }
    }
  }

  appInterface.onChange(({ playing, videoId }, b) => {
    if (videoId !== state.videoId) {
      if (player) {
        player.getPlayer().loadVideoById(videoId);
      }

      state.videoId = videoId;
    }
    if (state.playing !== playing) {
      if (playing) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
      state.playing = playing;
    }
  });
  appInterface.onLoad((state) => {
    // updateQuestion(state);

    loaded = true;
  });
  function goClicked() {
    appInterface.update("videoId", videoIdInput);
    appInterface.update("playing", true);
  }
</script>

{#if !loaded}
  <div>Loading...</div>
{:else}

  <Youtube
    videoId={state.videoId}
    height="150"
    bind:this={player}
    on:StateChange={onVideoStateChange} />
  Enter a new video ID:
  <input bind:value={videoIdInput} />
  <button on:click={goClicked}>Go</button>
{/if}
