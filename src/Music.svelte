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
  .playButton {
    background-color: white;
    color: #852755;
    border: solid 1px #852755;
    border-radius: 10px;
    padding: 10px 15px;
  }
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
      transform: scale(1.15) !important;
  }
  b {
      display: inline-block;
      width: 150px;
  }
  p {
    width: 20px;
    display: inline-block;
  }
  span {
    width: 150px;
    display: inline-block;
   }


   input[type=checkbox] + label {
     display: inline-block;
     margin: 4px 0;
     cursor: pointer;
     padding: 0;
   }

   input[type=checkbox] {
     display: none;
   }

   input[type=checkbox] + label:before {
     content: "";
     background-color: #f9f0d6;
     border: 0.1em solid #e6dcc0;
     border-radius: 0.2em;
     display: inline-block;
     width: 25px;
     height: 25px;
     padding-left: 0.2em;
     padding-bottom: 0.3em;
     margin-right: 0.2em;
     vertical-align: bottom;
     color: transparent;
     transition: .2s;
   }

   input[type=checkbox] + label:hover:before {
        background-color: #e6dcc0;
    }

   input[type=checkbox] + label:active:before {
     transform: scale(0);
   }

   input[type=checkbox]:checked + label:before {
     background-color: red;
     border-color: red;
     color: #fff;
   }
   input[type=checkbox]:checked + label.snare:before {
        background-color: #ffdb3e;
        border-color: #ffdb3e;
      }
    input[type=checkbox]:checked + label.kick:before {
            background-color: #ff5115;
            border-color: #ff5115;
          }
    input[type=checkbox]:checked + label.tone1:before {
                background-color: #f91211;
                border-color: #f91211;
              }
              input[type=checkbox]:checked + label.tone2:before {
                              background-color: #b81645;
                              border-color: #b81645;
                            }
                            input[type=checkbox]:checked + label.tone3:before {
                                            background-color: #852755;
                                            border-color: #852755;
                                          }
</style>

{#if !loaded}
  <div>Loading...</div>
{:else}
    <button on:click={playPause} class="playButton">
         &#9658;&nbsp; &#10074; &#10074;
    </button> &nbsp;{#if playing}
               Playing...
    {/if}<br>
    <input
          type=range
          min="1"
          max="500"
          bind:value={tempo}
          on:change={setTheInt}
    > {tempo} BPM<br><br>
    <div>
      <div>
          <span>
            <input
                 type=range
                 min="0"
                 max="10"
                 bind:value={octave1}
                 on:change={updateState}
            > {octave1}
          </span>
        {#each itemsTone1 as item}
                <input
                    type="checkbox"
                    bind:group={selectedTone1}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                    id="tone1-{item}"
                />
                <label
                    for="tone1-{item}"
                    class="tone1"
                    class:active="{timer==item}"
                />
        {/each}
        </div>
        <div>
          <span>
            <input
                 type=range
                 min="0"
                 max="10"
                 bind:value={octave2}
                 on:change={updateState}
           > {octave2}
         </span>
        {#each itemsTone2 as item}
                <input
                    type="checkbox"
                    bind:group={selectedTone2}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                    id="tone2-{item}"
                />
                <label
                    for="tone2-{item}"
                    class="tone2"
                    class:active="{timer==item}"
                />
        {/each}
         </div>
         <div>
            <span>
              <input
                   type=range
                   min="0"
                   max="10"
                  bind:value={octave3}
                  on:change={updateState}
              > {octave3}
            </span>
        {#each itemsTone3 as item}
                <input
                    type="checkbox"
                    bind:group={selectedTone3}
                    on:change={updateState}
                    value={item}
                    class:active="{timer==item}"
                    id="tone3-{item}"
                />
                <label
                    for="tone3-{item}"
                    class="tone3"
                    class:active="{timer==item}"
                />
        {/each}
        </div>
        <div>
                  <b>Snare</b>
                  {#each itemsSnare as item}
                          <input
                              type="checkbox"
                              bind:group={selectedSnare}
                              on:change={updateState}
                              value={item}
                              id="snare-{item}"
                          />
                          <label
                              for="snare-{item}"
                              class="snare"
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
                            id="kick-{item}"
                        />
                        <label
                            for="kick-{item}"
                            class="kick"
                            class:active="{timer==item}"
                        />
                {/each}
              </div>
    </div>
{/if}
