<script>
  import { AppInterface } from "./AppInterface";
  import Toggle from "./Toggle.svelte";
  import Tone from "./Tone.js";

  import _ from "lodash";
  import App from "./App.svelte";

  const appInterface = new AppInterface();

  let playing = false;
  let loaded = false;

  let timer = 1;
  let tempo = 240;

  const synth1 = new Tone.Synth();
  synth1.oscillator.type = "pwm";
  synth1.toMaster();

  const synth2 = new Tone.Synth();
  synth2.oscillator.type = "pwm";
  synth2.toMaster();

  const synth3 = new Tone.Synth();
  synth3.oscillator.type = "pwm";
  synth3.toMaster();

  const kickDrum = new Tone.MembraneSynth();
  kickDrum.toMaster();

  const lowPass = new Tone.Filter({
    frequency: 8000,
  }).toMaster();

  const snareDrum = new Tone.NoiseSynth({
    volume: 1,
    noise: {
      type: 'white',
      playbackRate: 3,
    },
    envelope: {
      attack: 0.001,
      decay: 0.20,
      sustain: 0.15,
      release: 0.03,
    },
  }).connect(lowPass);

  let selectedSnare = [];
  let selectedKick = [];
  let selectedTone1 = [];
  let selectedTone2 = [];
  let selectedTone3 = [];

  let octave1 = 3;
  let octave2 = 3;
  let octave3 = 3;

  let steps = 16;
  let itemsMaster = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16'
  ];

  let itemsKick = itemsMaster;
  let itemsSnare = itemsMaster;

  let itemsTone1 = itemsMaster;
  let itemsTone2 = itemsMaster;
  let itemsTone3 = itemsMaster;


  function updatePlaying(state) {
    playing = state.playing;
    if (state.timer) {
      timer = state.timer;
      }
    if (state.selectedSnare) {
        selectedSnare = state.selectedSnare;
    }
    if (state.selectedKick) {
        selectedKick = state.selectedKick;
    }
    if (state.selectedTone1) {
        selectedTone1 = state.selectedTone1;
    }
    if (state.selectedTone2) {
        selectedTone2 = state.selectedTone2;
    }
    if (state.selectedTone3) {
        selectedTone3 = state.selectedTone3;
    }
    if (state.octave1) {
          octave1 = state.octave1;
    }
    if (state.octave2) {
          octave2 = state.octave2;
    }
    if (state.octave3) {
          octave3 = state.octave3;
    }
    if (state.tempo) {
      tempo = state.tempo;
    }
  }
  appInterface.onChange(updatePlaying);
  appInterface.onLoad((state) => {
    updatePlaying(state);
    appInterface.setFrameHeight(300);
    loaded = true;
  });

  function playPause() {
      if (playing) {
          clearInt();
      }
      else {
          setTheInt();
      }
      playing = !playing;
      appInterface.update("playing", playing);
      timer = 0;
      appInterface.update("timer", timer);
  }

  function updateState() {
      appInterface.update("selectedSnare", selectedSnare);
      appInterface.update("selectedKick", selectedKick);
      appInterface.update("selectedTone1", selectedTone1);
      appInterface.update("selectedTone2", selectedTone2);
      appInterface.update("selectedTone3", selectedTone3);
      appInterface.update("octave1", octave1);
      appInterface.update("octave2", octave2);
      appInterface.update("octave3", octave3);
      appInterface.update("tempo", tempo);
  }

  function player() {
      if (playing == true) {
          var pos = "" + timer;
          if (selectedSnare.includes(pos)) {
               snareDrum.triggerAttackRelease('32n');
          }
          if (selectedKick.includes(pos)) {
               kickDrum.triggerAttackRelease("C1", "8n");
          }
          if (selectedTone1.includes(pos)) {
               synth1.triggerAttackRelease("C" + octave1, "16n");
          }
          if (selectedTone2.includes(pos)) {
               synth2.triggerAttackRelease("E" + octave2, "16n");
          }
          if (selectedTone3.includes(pos)) {
               synth3.triggerAttackRelease("G" + octave3, "16n");
          }
          timer++;
          if (timer > steps ) {
              timer = 1;
          }
      }
  }

  function clearInt() {
      clearInterval(setInt);
  }

  var setInt;

  function setTheInt() {
       clearInterval(setInt);
       setInt = setInterval(function(){
           player();
       }, (60/tempo*1000));
       appInterface.update("tempo", tempo);
  }

  function clearChecks() {
      selectedSnare = [];
      selectedKick = [];
  }
</script>

<style>
  input {
      margin: 0;
      width: 100px;
  }
  input[type="checkbox"] {
      transform: scale(2);
      display: inline-block;
      width: 20px;
      margin: 12px 10px;
  }
  .active {
      transform: scale(2.5) !important;
  }
  b {
      display: inline-block;
      width: 150px;
  }
  p {
    width: 20px;
    display: inline-block;
  }
  label {
    width: 150px;
    display: inline-block;
   }
</style>

{#if !loaded}
  <div>Loading...</div>
{:else}
    <button on:click={playPause}>
         &#9658;&nbsp; &#10074; &#10074;
    </button> &nbsp;{#if playing}
               Playing...
    {/if}<br>
    <b>BPM</b>
    <input
          type=number
          bind:value={tempo}
          on:change={setTheInt}
    >
    <div>
      <div>
          <b>Snare</b>
          {#each itemsSnare as item}
                  <input
                      type="checkbox"
                      bind:group={selectedSnare}
                      on:change={updateState}
                      value={item}
                      class:active="{timer==item}"
                  />
          {/each}
      </div>
      <div>
        <b>Kick</b>
        {#each itemsKick as item}
                <input
                    type="checkbox"
                    bind:group={selectedKick}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                />
        {/each}
      </div>
      <div>
          <label>
            <input
                 type=range
                 min="0"
                 max="10"
                 bind:value={octave1}
                 on:change={updateState}
            > {octave1}
          </label>
        {#each itemsTone1 as item}
                <input
                    type="checkbox"
                    bind:group={selectedTone1}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                />
        {/each}
        </div>
        <div>
          <label>
            <input
                 type=range
                 min="0"
                 max="10"
                 bind:value={octave2}
                 on:change={updateState}
           > {octave2}
         </label>
        {#each itemsTone2 as item}
                <input
                    type="checkbox"
                    bind:group={selectedTone2}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                />
        {/each}
         </div>
         <div>
            <label>
              <input
                   type=range
                   min="0"
                   max="10"
                  bind:value={octave3}
                  on:change={updateState}
              > {octave3}
            </label>
        {#each itemsTone3 as item}
                <input
                    type="checkbox"
                    bind:group={selectedTone3}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                />
        {/each}

        </div>
    </div>
{/if}
