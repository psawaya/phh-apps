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
  let timer = 1;

  	let selectedSnare = [];
      let selectedBass = [];
      let selectedHat = [];

  	let items = [
  		'Item1',
  		'Item2',
  		'Item3',
  		'Item4',
  		'Item5',
          'Item6',
          'Item7',
          'Item8'
  	];
  	let itemsBass = [
  		'Item1',
  		'Item2',
  		'Item3',
  		'Item4',
  		'Item5',
          'Item6',
          'Item7',
          'Item8'
      ];
      let itemsHat = [
  		'Item1',
  		'Item2',
  		'Item3',
  		'Item4',
  		'Item5',
          'Item6',
          'Item7',
          'Item8'
      ];



  function updatePlaying(state) {
    playing = state.playing;
    if (state.timer) {
      timer = state.timer;
      }
    selectedSnare = state.selectedSnare;
    selectedBass = state.selectedBass;
    selectedHat = state.selectedHat;

}
  appInterface.onChange(updatePlaying);
  appInterface.onLoad((state) => {
    updatePlaying(state);

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

setInterval(function(){

    if (playing == true) {
        var pos = "Item" + timer;
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

}, 250);


function playPause() {
    playing = !playing;
    console.log(playing);
    appInterface.update("playing", playing);
    timer = 1;
    appInterface.update("timer", timer);
}


function updateState() {
    appInterface.update("selectedSnare", selectedSnare);
    appInterface.update("selectedBass", selectedBass);
    appInterface.update("selectedHat", selectedHat);
    console.log("updating state!!!!!!!!");
}


</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
    <pre>


    {#each items as item}
    	<label>
    		<input
    			type="checkbox"
    			bind:group={selectedSnare}
                on:change={updateState}
    			value={item}
    		/> {item}
    	</label>
    {/each}
    Snare: {selectedSnare && selectedSnare.join(', ')}

    {#each itemsBass as item}
        	<label>
        		<input
        			type="checkbox"
        			bind:group={selectedBass}
        			on:change={updateState}
        			value={item}
        		/> {item}
        	</label>
        {/each}
        Bass: {selectedBass && selectedBass.join(', ')}

        {#each itemsHat as item}
                	<label>
                		<input
                			type="checkbox"
                			bind:group={selectedHat}
                            on:change={updateState}
                			value={item}
                		/> {item}
                	</label>
                {/each}
                Hat: {selectedHat && selectedHat.join(', ')}

    </pre>
  {#if playing}
    MUSIC!
  {:else}
    no music...
  {/if}
  <button on:click={playPause}>
        <b>Play/Pause</b>
  </button>
{/if}
