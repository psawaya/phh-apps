<script>
  import { AppInterface } from "./AppInterface";
  // Shamelessly lifted from https://museumhack.com/list-icebreakers-questions/
  import { ICEBREAKER_QUESTIONS } from "./IcebreakerQuestions";
  import _ from "lodash";

  const appInterface = new AppInterface();

  let currentQuestion = null;
  let loaded = false;

  let players = [];

  function newQuestion() {
    currentQuestion = _.sample(ICEBREAKER_QUESTIONS);
    appInterface.update("currentQuestion", currentQuestion);
  }
  function updateQuestion(state) {
    loadPlayers();
    if (state.currentQuestion) {
      currentQuestion = state.currentQuestion;
    }
  }
  appInterface.onChange(updateQuestion);
  appInterface.onLoad((state) => {
    updateQuestion(state);

    loadPlayers();
    loaded = true;
  });

  async function loadPlayers() {
    players = await appInterface.getPlayers();
  }
</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
  {#if currentQuestion}
    <div>{currentQuestion}</div>
  {/if}
  <div>
    <button on:click={newQuestion}>
      {#if currentQuestion}New Question{:else}Ask a question{/if}
    </button>
  </div>
{/if}
