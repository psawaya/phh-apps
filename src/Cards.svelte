<script>
  import { AppInterface } from "./AppInterface";

  const appInterface = new AppInterface();
  let loaded = false;
  let arePlayersLoaded = false;

  let cardNext = null;
  let cardLast = null;
  let guess = null;
  let streak = 0;
  let score = 0;
  let gameOver = false;

  let players = [];
  let filtered = [];
  let currentPlayer = null;
  let localPlayer = null;

  function draw() {
    fetch("https://deckofcardsapi.com/api/deck/new/draw/")
      .then((res) => res.json())
      .then((data) => (cardNext = data))
      .then(() => appInterface.update("cardNext", cardNext))
      .then(() => compareCards());
    if (cardNext) {
      cardLast = cardNext;
      appInterface.update("cardLast", cardLast);
    }
  }
  function compareCards() {
    var card1 = formatCard(cardNext.cards[0].code.charAt(0));
    var card2 = formatCard(cardLast.cards[0].code.charAt(0));
    if (card1 > card2) {
      if (guess == "higher") {
        streak++;
        score++;
        appInterface.update("streak", streak);
      } else {
        streak = 0;
        score++;
        appInterface.update("streak", 0);
        appInterface.update("score", score);
      }
    } else if (card1 < card2) {
      if (guess == "lower") {
        streak++;
        score++;
        appInterface.update("streak", streak);
      } else {
        streak = 0;
        score++;
        appInterface.update("streak", 0);
        appInterface.update("score", score);
      }
    } else if (card1 == card2) {
      // DO SOMETHING IN THE EVENT OF A TIE
    }
    guess = null;
    appInterface.update("guess", null);
    if (streak > 2) {
      gameOver = true;
      score = score - 3;
      appInterface.update("gameOver", true);
    }
  }
  function formatCard(card) {
    switch (card) {
      case "0":
        card = 10;
        break;
      case "J":
        card = 11;
        break;
      case "Q":
        card = 12;
        break;
      case "K":
        card = 13;
        break;
      case "A":
        card = 14;
        break;
      default:
        break;
    }
    return card;
  }
  function resetGame() {
    streak = 0;
    score = 3;
    cardLast = null;
    gameOver = false;
    guess = null;
    appInterface.update("streak", 0);
    appInterface.update("cardLast", null);
    appInterface.update("score", score);
    appInterface.update("guess", null);
    appInterface.update("gameOver", false);
    nextPlayer();
  }
  // I'm sure there is a way to combine these two functions...
  function guessHigher() {
    guess = "higher";
    appInterface.update("guess", "higher");
  }
  function guessLower() {
    guess = "lower";
    appInterface.update("guess", "lower");
  }
  function nextPlayer() {
    if (currentPlayer < filtered.length - 1) {
      currentPlayer++;
    } else {
      currentPlayer = 0;
    }
    appInterface.update("currentPlayer", currentPlayer);
  }
  function updateCard(state) {
    loadPlayers();
    gameOver = state.gameOver;
    currentPlayer = state.currentPlayer;
    if (currentPlayer == null) {
      nextPlayer();
    }
    if (state.cardNext) {
      cardNext = state.cardNext;
    }
    if (state.cardLast) {
      cardLast = state.cardLast;
    }
    if (state.score) {
      score = state.score;
    }
    streak = state.streak;
    guess = state.guess;
  }
  appInterface.onChange(updateCard);
  appInterface.onLoad((state) => {
    updateCard(state);
    loadPlayers();
    loaded = true;
  });
  async function loadPlayers() {
    players = await appInterface.getPlayers();
    var filteredList = players;
    filtered = filteredList.filter(function (x) {
      return x !== undefined;
    });
    arePlayersLoaded = true;
    localPlayer = filtered.find((player) => player.localPlayer == true);
  }
</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
  <div style="height: 150px">
    {#if !arePlayersLoaded}
      Loading...
    {:else}
      <div style="display:inline-block">
        <b style="display:block;">
          {#if filtered[currentPlayer]}
            {filtered[currentPlayer].name}
          {:else}EMPTY{/if}
          's Turn!
        </b>
        {#if filtered[currentPlayer].id == localPlayer.id}
          {#if !gameOver}
            {#if cardNext}
              <div style="display:inline-block; margin-right: 10px;">
                <button on:click={guessHigher}>Higher</button>
              </div>
              <div style="display:inline-block; margin-right: 10px;">
                <button on:click={guessLower}>Lower</button>
              </div>
            {/if}
          {/if}
        {:else if !gameOver}
          <div style="display:inline-block; margin-right: 10px;">
            <button on:click={draw}>
              <b>Draw</b>
            </button>
          </div>
        {/if}
      </div>
    {/if}
    {#if cardNext}
      <div style="display:inline-block; margin-right: 10px;">
        <img src={cardNext.cards[0].image} height="100" />
        <h3 style="margin:0;text-align: center;">{cardNext.cards[0].code}</h3>
      </div>
    {/if}
    {#if cardLast}
      <div style="display:inline-block">
        <img src={cardLast.cards[0].image} height="90" />
        <h4 style="margin:0;text-align: center;">
          Last: {cardLast.cards[0].code}
        </h4>
      </div>
    {/if}
    {#if !gameOver}{/if}
    {#if gameOver}
      <div style="display:inline-block">
        <h4 style="margin:0;">Next Player!</h4>
        <h2 style="margin:0;">You owe: {score}</h2>
        <h4 style="margin:0;">
          Guess higher or lower. Get 3 in a row, or you owe!
        </h4>
      </div>
      <div style="display:inline-block">
        <button on:click={resetGame}>Play Again</button>
      </div>
    {:else}
      <div style="display:inline-block">
        <h2 style="margin:0;">{streak}</h2>
        <h4 style="margin:0;text-align: center;">Streak</h4>
      </div>
      {#if score}
        <div style="display:inline-block">
          <h2 style="margin:0;">{score}</h2>
          <h4 style="margin:0;text-align: center;">Score</h4>
        </div>
      {/if}
      {#if guess}
        <div style="display:inline-block">
          <h2 style="margin:0;">{guess}</h2>
          <h4 style="margin:0;text-align: center;">Guess</h4>
        </div>
      {/if}
    {/if}
  </div>
{/if}
