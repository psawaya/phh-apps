<script>
  import { AppInterface } from "./AppInterface";
  // Shamelessly lifted from https://museumhack.com/list-icebreakers-questions/
  import { ICEBREAKER_QUESTIONS } from "./IcebreakerQuestions";
  import _ from "lodash";
  import App from "./App.svelte";

  const appInterface = new AppInterface();

  let currentQuestion = null;
  let loaded = false;

  function newQuestion() {
    currentQuestion = _.sample(ICEBREAKER_QUESTIONS);
    appInterface.update("currentQuestion", currentQuestion);
  }
  function updateQuestion(state) {
    if (state.currentQuestion) {
      currentQuestion = state.currentQuestion;
    }
  }
  appInterface.onChange(updateQuestion);
  appInterface.onLoad((state) => {
    updateQuestion(state);

    loaded = true;
  });
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
