<script context="module">
  let YouTubeIframeAPIReady = false;
</script>

<script>
  let player;
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();
  let divId = "player_" + parseInt(Math.random() * 100000).toString();
  let hasPlayed = false;
  export let videoId;
  export let height = "390";
  export let width = "640";
  onMount(() => {
    let ytTagUrl = "https://www.youtube.com/iframe_api";
    if (!isMyScriptLoaded(ytTagUrl)) {
      // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement("script");
      tag.src = ytTagUrl;
      var firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = function () {
      window.dispatchEvent(new Event("YouTubeIframeAPIReady"));
    };
    window.addEventListener("YouTubeIframeAPIReady", function () {
      if (YouTubeIframeAPIReady == false) {
        // first load of an YT Video on this project
        YouTubeIframeAPIReady = true; // now the Player can be created
        createPlayer();
      }
    });
    function createPlayer() {
      player = new YT.Player(divId, {
        height,
        width,
        videoId: videoId,
        playerVars: { autoplay: 1 },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
    if (YouTubeIframeAPIReady) {
      createPlayer(); // if the YT Script is ready, we can create our player
    }
  });
  function onPlayerReady() {
    player.playVideo();
  }
  function isMyScriptLoaded(url = "") {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length; i--; ) {
      if (scripts[i].src == url) return true;
    }
    return false;
  }
  function onPlayerStateChange(stateChange) {
    const { data } = stateChange;
    if (data === -1) {
      player.playVideo();
    }
    dispatch("StateChange", data);
  }
  export function pauseVideo() {
    player.pauseVideo();
  }
  export function playVideo() {
    if (!hasPlayed) {
      player.setVolume(0); // Mute the video the first time so that YT allows autoplay
    }
    player.playVideo();
    hasPlayed = true;
  }
  export function getPlayer() {
    return player;
  }
</script>

<!-- Ripped from https://github.com/sveltecasts/svelte-youtube -->
<div class="yt-component" style="display:{videoId === '' ? 'none' : 'block'}">
  <div id={divId} />
</div>
