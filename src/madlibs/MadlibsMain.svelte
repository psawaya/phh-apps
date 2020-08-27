<script>
  import { AppInterface } from "../AppInterface";

  import _ from "lodash";

  import Madlib from "./Madlib.svelte";
  import MadlibComplete from "./MadlibComplete.svelte";
  import { MADLIBS_DATA } from "./MadlibsData";

  const appInterface = new AppInterface();

  let loaded = false;

  let players = [];

  let currentMadlibTitle = "";

  let state = getDefaultState();

  function getDefaultState() {
    return {
      gameState: "choose_madlib",
      selectedMadlib: null,
      blanks: [],
      currentBlank: 0,
    };
  }

  function getSelectedMadlib(madlibId) {
    return _.find(MADLIBS_DATA, ["id", madlibId]);
  }

  function onChange(newState) {
    loadPlayers();
    // update state
    state = newState;
  }
  appInterface.onChange(onChange);
  appInterface.onLoad(async (state) => {
    appInterface.setFrameHeight(400);
    onChange(state);
    if (_.isEqual(state, {})) {
      // If state is empty, initialize state
      resetGame();
    }

    await loadPlayers();

    loaded = true;
  });

  function selectMadlib(madlibId) {
    appInterface.update("gameState", "picked_madlib");
    appInterface.update("selectedMadlib", madlibId);
    appInterface.update("currentBlank", 0);
    appInterface.update(
      "blanks",
      getSelectedMadlib(madlibId).blanks.map((blank, idx) => {
        return {
          id: idx,
          partOfSpeech: blank,
          word: "",
          owner: null,
        };
      })
    );
    appInterface.update("currentPlayerTurn", _.sample(players).sessionId);
  }

  function resetGame() {
    _.forEach(getDefaultState(), (val, key) => {
      appInterface.update(key, val);
    });
  }

  async function loadPlayers() {
    players = await appInterface.getPlayers();
  }
</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
  {#if state.gameState === 'choose_madlib'}
    <ul>
      {#each MADLIBS_DATA as madlib (madlib.id)}
        <li>
          <a
            href="#"
            on:click={() => {
              selectMadlib(madlib.id);
            }}>
            {madlib.title}
          </a>
        </li>
      {/each}

    </ul>
  {:else if state.gameState === 'picked_madlib'}
    <Madlib
      madlib={_.find(MADLIBS_DATA, ['id', state.selectedMadlib])}
      {appInterface}
      {players}
      {state} />
  {:else if state.gameState === 'madlib_complete'}
    <MadlibComplete
      madlib={_.find(MADLIBS_DATA, ['id', state.selectedMadlib])}
      {appInterface}
      {players}
      {state} />
  {/if}

  <button on:click={resetGame}>Reset game</button>
{/if}
