<script>
  export let madlib = null;
  export let appInterface = null;
  export let state = null;
  export let players = null;

  import _ from "lodash";

  let currentInput = "";

  let localPlayer = players.filter((player) => {
    return player.localPlayer;
  })[0];

  function getPlayerBySessionId(sessionId) {
    const ret = players.filter((player) => {
      return player.sessionId === sessionId;
    });
    if (ret.length === 1) {
      return ret[0];
    }
  }

  function isMyTurn() {
    return state.currentPlayerTurn === localPlayer.sessionId;
  }

  function fillBlank(blankId) {
    const blanks = _.clone(state.blanks);
    blanks[state.currentBlank].owner = localPlayer.name;
    blanks[state.currentBlank].word = currentInput;
    currentInput = "";
    appInterface.update("blanks", blanks);
    if (state.currentBlank === state.blanks.length - 1) {
      appInterface.update("gameState", "madlib_complete");
    } else {
      appInterface.update("currentBlank", state.currentBlank + 1);
    }

    const localPlayerIdx = _.findIndex(players, [
      "sessionId",
      localPlayer.sessionId,
    ]);
    appInterface.update(
      "currentPlayerTurn",
      players[(localPlayerIdx + 1) % players.length].sessionId
    );
  }
</script>

<h1>{madlib.title}</h1>
<div>
  {#each state.blanks as blank (blank.id)}
    <div>
      <strong>
        {blank.partOfSpeech}{blank.owner ? ` (${blank.owner})` : ''}
      </strong>

      {#if state.currentBlank === blank.id && getPlayerBySessionId(state.currentPlayerTurn)}
        <div>
          {#if isMyTurn()}
            It's your turn!
          {:else}
            It's {getPlayerBySessionId(state.currentPlayerTurn).name}'s turn!
          {/if}
        </div>
      {/if}
      {#if blank.id !== state.currentBlank || !isMyTurn()}
        <!-- We're not filling this blank out  -->
        <input disabled={true} value={blank.word} />
      {/if}
      {#if blank.id === state.currentBlank}
        {#if isMyTurn()}
          <input bind:value={currentInput} />
          <button
            on:click={() => {
              fillBlank(blank.id);
            }}>
            Fill
          </button>
        {:else}
          <button
            on:click={() => {
              appInterface.update('currentPlayerTurn', localPlayer.sessionId);
            }}>
            Take turn
          </button>
        {/if}
      {/if}
    </div>
  {/each}
</div>
