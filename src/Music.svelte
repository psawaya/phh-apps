<script>
  import { AppInterface } from "./AppInterface";
  import Toggle from "./Toggle.svelte";

  import _ from "lodash";
  import App from "./App.svelte";

  const appInterface = new AppInterface();

  let playing = false;

  let loaded = false;

  let players = [];
  let localPlayer = null;
  let timer = 0;
  let tempo = 120;

  	let selectedSnare = [];
      let selectedBass = [];
      let selectedHat = [];

  	let items = [
  		'1',
  		'2',
  		'3',
  		'4',
  		'5',
        '6',
        '7',
        '8'
  	];
  	let itemsBass = [
  		'1',
  		'2',
  		'3',
  		'4',
  		'5',
        '6',
        '7',
        '8'
      ];
      let itemsHat = [
  		'1',
  		'2',
  		'3',
  		'4',
  		'5',
        '6',
        '7',
        '8'
      ];



  function updatePlaying(state) {
    playing = state.playing;
    if (state.timer) {
      timer = state.timer;
      }
      if (state.selectedSnare) {
        selectedSnare = state.selectedSnare;
      }
      if (state.selectedBass) {
    selectedBass = state.selectedBass;
    }
    if (state.selectedHat) {
      selectedHat = state.selectedHat;
     }
      if (state.tempo) {
        tempo = state.tempo;
    }

}
  appInterface.onChange(updatePlaying);
  appInterface.onLoad((state) => {
    updatePlaying(state);
    appInterface.setFrameHeight(450);
    loadPlayers();
    loaded = true;
  });

  async function loadPlayers() {
    players = await appInterface.getPlayers();
    localPlayer = players.find((player) => player.localPlayer == true);
  }


// document.documentElement.addEventListener('mousedown', () => {
//   if (Tone.context.state !== 'running') Tone.context.resume();
// });

var bass = new Audio("https://freewavesamples.com/files/Bass-Drum-1.wav");
var snare = new Audio("https://freewavesamples.com/files/Ensoniq-ESQ-1-Snare.wav");
var kick = new Audio("https://freewavesamples.com/files/Floor-Tom-1.wav");
var hat = new Audio("https://freewavesamples.com/files/Closed-Hi-Hat-1.wav");



function playPause() {
    if (playing) {
        clearInt();
    }
    else {
        setTheInt();
    }
    playing = !playing;
    console.log(playing);
    appInterface.update("playing", playing);
    timer = 0;
    appInterface.update("timer", timer);
}


function updateState() {
    appInterface.update("selectedSnare", selectedSnare);
    appInterface.update("selectedBass", selectedBass);
    appInterface.update("selectedHat", selectedHat);
    appInterface.update("tempo", tempo);
    console.log("updating state!!!!!!!!");

}

function player() {
 if (playing == true) {
            var pos = "" + timer;
            console.log(pos);
            if (selectedSnare.includes(pos)) {
                    snare.pause();
                    snare.currentTime = 0;
                    snare.play();
                    console.log("snare");
            }
            if (selectedHat.includes(pos)) {
                    hat.pause();
                    hat.currentTime = 0;
                    hat.play();
                    console.log("hat");
            }
            if (selectedBass.includes(pos)) {
                            bass.pause();
                            bass.currentTime = 0;
                            bass.play();
                            console.log("bass");
                    }
            timer++;
            if (timer > 8 ) {
                timer = 1;
            }
            console.log("TIMERRRRRR", timer);
        }
        console.log("player", tempo);
}

function clearInt() {
    clearInterval(setInt);
}

var setInt;


function setTheInt() {
     clearInterval(setInt);
     setInt = setInterval(function(){
         player();
         console.log("setInt", tempo);
     }, (60/tempo*1000));
     appInterface.update("tempo", tempo);
}

function clearChecks() {
    selectedSnare = [];
    selectedBass = [];
    selectedHat = [];
}
</script>

<style>
    input[type="checkbox"] {
        transform: scale(2);
        display: inline-block;
        width: 30px;
        margin: 20px 10px;
    }
    .active {
        transform: scale(2.5) !important;
    }
</style>

{#if !loaded}
  <div>Loading...</div>
{:else}
<button on:click={playPause}>
        <b>&#9658;&nbsp; &#10074; &#10074;</b>
  </button> {#if playing}
               Playing...
             {/if}<br>
          <b>BPM</b>
          <input
              type=number
              bind:value={tempo}
              on:change={setTheInt}
          >
        <pre>
          <hr>
        <b>snare</b>
        {#each items as item}

                <input
                    type="checkbox"
                    bind:group={selectedSnare}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                />

        {/each}
        <b>Bass</b>
        {#each itemsBass as item}

        		<input
        			type="checkbox"
        			bind:group={selectedBass}
        			on:change={updateState}
        			value={item}
                    class:active="{timer==item}"
        		/>

        {/each}
        <b>Hi Hat</b>
        {#each itemsHat as item}

                <input
                    type="checkbox"
                    bind:group={selectedHat}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                />

        {/each}
        <hr>
    </pre>
    <!--
            debug
          <button on:click={clearInt}>
                  <b>Clear Int </b>
            </button>
              <button on:click={setTheInt}>
                      <b>Set Int</b>
                </button>
                <button on:click={clearChecks}>
                              <b>Clear</b>
                        </button>
     -->
{/if}
