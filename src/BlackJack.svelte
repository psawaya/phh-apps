<script>
  import { AppInterface } from "./AppInterface";
  import App from "./App.svelte";

  const appInterface = new AppInterface();
  let loaded = false;
  let arePlayersLoaded = false;

  let players = [];
  let filtered = [];
  let gamePlayers = [];
  let localPlayer = null;
  let currentPlayer = 0;
  let gameState = "off";
  let dealer = { points: 0, hand: [] };

  var suits = ["S", "H", "D", "C"];
  var values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  var deck = new Array();

  function createDeck() {
    deck = new Array();
    for (var i = 0; i < values.length; i++) {
      for (var x = 0; x < suits.length; x++) {
        var weight = parseInt(values[i]);
        if (values[i] == "J" || values[i] == "Q" || values[i] == "K")
          weight = 10;
        if (values[i] == "A") weight = 11;
        var card = { value: values[i], suit: suits[x], weight: weight };
        deck.push(card);
      }
    }
  }
  function shuffle() {
    for (var i = 0; i < 1000; i++) {
      var location1 = Math.floor(Math.random() * deck.length);
      var location2 = Math.floor(Math.random() * deck.length);
      var tmp = deck[location1];

      deck[location1] = deck[location2];
      deck[location2] = tmp;
    }
    appInterface.update("deck", deck);
  }
  function createPlayers() {
    for (var i = 0; i < filtered.length; i++) {
      var hand = new Array();
      var player = {
        name: filtered[i].name,
        id: filtered[i].id,
        points: 0,
        hand: hand,
        result: null,
      };
      gamePlayers.push(player);
    }
  }
  function dealHands() {
    for (var i = 0; i < 2; i++) {
      for (var x = 0; x < gamePlayers.length; x++) {
        var card = deck.pop();
        gamePlayers[x].hand.push(card);
      }
    }
    for (var i = 0; i < 2; i++) {
      var card = deck.pop();
      dealer.hand.push(card);
    }
    appInterface.update("deck", deck);
  }
  function hitMe() {
    var card = deck.pop();
    gamePlayers[currentPlayer].hand.push(card);
    appInterface.update("gamePlayers", gamePlayers);
    appInterface.update("deck", deck);
    updatePoints();
  }
  function hitDealer() {
    var card = deck.pop();
    dealer.hand.push(card);
    checkDealer();
    appInterface.update("deck", deck);
  }
  function stay() {
    nextPlayer();
  }
  function updatePoints() {
    var playerScore = 0;
    var hasAce = false;
    for (var x = 0; x < gamePlayers[currentPlayer].hand.length; x++) {
      playerScore = playerScore + gamePlayers[currentPlayer].hand[x].weight;
      if (gamePlayers[currentPlayer].hand[x].weight == 11) {
        hasAce = true;
      }
    }
    gamePlayers[currentPlayer].points = playerScore;
    appInterface.update("gamePlayers", gamePlayers);
    if (playerScore > 20) {
      if (hasAce == true && playerScore == 21) {
        nextPlayer();
      } else if (hasAce == true && playerScore > 21) {
        playerScore -= 10;
        gamePlayers[currentPlayer].points = playerScore;
        appInterface.update("gamePlayers", gamePlayers);
        if (playerScore > 20) {
          nextPlayer();
        }
      } else {
        nextPlayer();
      }
    }
  }
  function nextPlayer() {
    if (currentPlayer < gamePlayers.length - 1) {
      currentPlayer++;
      updatePoints();
      appInterface.update("currentPlayer", currentPlayer);
    } else {
      checkDealer();
    }
  }
  function checkDealer() {
    var dealerScore = 0;
    var dealerAce = false;
    for (var x = 0; x < dealer.hand.length; x++) {
      dealerScore = dealerScore + dealer.hand[x].weight;
      if (dealer.hand[x].weight == 11) {
        dealerAce = true;
      }
    }
    if ((dealerAce = true && dealerScore > 21)) {
      dealerScore -= 10;
    }
    dealer.points = dealerScore;
    appInterface.update("dealer", dealer);
    if (dealerScore < 17) {
      hitDealer();
    } else {
      compareHands();
    }
  }
  function compareHands() {
    for (var x = 0; x < gamePlayers.length; x++) {
      var playerPoints = gamePlayers[x].points;
      var dealerPoints = dealer.points;
      if (playerPoints > 21) {
        gamePlayers[x].result = "lose";
      } else if (dealerPoints > 21) {
        gamePlayers[x].result = "win";
      } else if (dealerPoints == 21) {
        if (playerPoints == 21) {
          gamePlayers[x].result = "tie";
        } else {
          gamePlayers[x].result = "lose";
        }
      } else if (dealer.points < playerPoints) {
        gamePlayers[x].result = "win";
      } else {
        gamePlayers[x].result = "lose";
      }
    }
    appInterface.update("gamePlayers", gamePlayers);
    gameState = "off";
    appInterface.update("gameState", "off");
  }
  function restartGame() {
    gamePlayers = [];
    deck = [];
    dealer = { points: 0, hand: [] };
    appInterface.update("gamePlayers", []);
    appInterface.update("deck", []);
    appInterface.update("dealer", { points: 0, hand: [] });
    currentPlayer = 0;
    appInterface.update("currentPlayer", currentPlayer);
    createDeck();
    shuffle();
    createPlayers();
    dealHands();
    updatePoints();
    appInterface.update("gameState", "on");
    appInterface.update("gamePlayers", gamePlayers);
    appInterface.update("dealer", dealer);
    console.log("restarting game........");
  }
  function updateGame(state) {
    loadPlayers();
    if (state.gameState) {
      gameState = state.gameState;
    }
    if (state.gamePlayers) {
      gamePlayers = state.gamePlayers;
    }
    if (state.dealer) {
      dealer = state.dealer;
    }
    if (state.deck) {
      deck = state.deck;
    }
    if (state.currentPlayer) {
      currentPlayer = state.currentPlayer;
    }
    currentPlayer = state.currentPlayer;
  }
  appInterface.onChange(updateGame);
  appInterface.onLoad((state) => {
    updateGame(state);
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

<style>
  body {
    padding: 0;
  }
  .container {
    background-color: #038046;
    font-size: 12px;
    width: 100%;
    height: 140px;
    border-radius: 10px;
  }
  .header {
    width: 100%;
    color: white;
    padding: 5px;
  }
  .player {
    color: white;
    float: left;
    min-width: 85px;
    min-height: 100px;
    text-align: center;
    border: solid 1px white;
    margin: 10px 5px;
    border-radius: 5px;
    padding: 5px;
  }
  .player b {
    display: block;
    text-align: center;
    margin-bottom: 5px;
  }
  .dealer {
    border-width: 3px;
  }
  .card {
    height: 50px;
    margin-right: 5px;
  }
  .controls {
    margin-top: 5px;
  }
  .controls button {
    background-color: whitemoke;
    border: none;
    font-weight: 600;
    margin-bottom: 0;
    padding: 1px 5px;
    font-size: 12px;
  }
  .admin {
    border-color: darkgreen;
    color: darkgreen;
    font-size: 10px;
  }
  .admin button {
    border-color: darkgreen;
    background: #038046;
    color: darkgreen;
  }
</style>

<div class="container">
  {#if !loaded}
    <div>Loading...</div>
  {:else}
    <div>
      {#if !arePlayersLoaded}
        Loading...
      {:else}
        <div class="player dealer">
          <b>BLACKJACK</b>
          {#if gameState == 'off'}
            <button on:click={restartGame}>START</button>
          {:else}
            <b>{gamePlayers[currentPlayer].name}'s turn</b>
          {/if}
        </div>
        {#each gamePlayers as player}
          <div class="player">
            <b>{player.name} - {player.points}</b>
            {#each player.hand as hand}
              {#if hand.value == 10}
                <img
                  class="card"
                  src="https://deckofcardsapi.com/static/img/0{hand.suit}.png" />
              {:else}
                <img
                  class="card"
                  src="https://deckofcardsapi.com/static/img/{hand.value}{hand.suit}.png" />
              {/if}
            {/each}
            <b>
              {#if player.result}{player.result}{/if}
            </b>
            {#if gamePlayers[currentPlayer].id == localPlayer.id}
              {#if gameState != 'off'}
                {#if player.id == localPlayer.id}
                  <div class="controls">
                    <button on:click={hitMe}>Hit</button>
                    <button on:click={stay}>Stay</button>
                  </div>
                {/if}
              {/if}
            {/if}
          </div>
        {/each}
        <div class="player dealer">
          {#if dealer.points}
            <b>dealer - {dealer.points}</b>
            {#each dealer.hand as card}
              {#if card.value == 10}
                <img
                  class="card"
                  src="https://deckofcardsapi.com/static/img/0{card.suit}.png" />
              {:else}
                <img
                  class="card"
                  src="https://deckofcardsapi.com/static/img/{card.value}{card.suit}.png" />
              {/if}
            {/each}
          {:else}
            <b>dealer</b>
            {#if dealer.hand[0]}
              {#if dealer.hand[0].value == 10}
                <img
                  class="card"
                  src="https://deckofcardsapi.com/static/img/0{dealer.hand[0].suit}.png" />
              {:else}
                <img
                  class="card"
                  src="https://deckofcardsapi.com/static/img/{dealer.hand[0].value}{dealer.hand[0].suit}.png" />
              {/if}
            {/if}
          {/if}
        </div>
        <div class="player admin">
          <p>ADMIN</p>
          <p>
            Don't press this
            <br />
            unless you're stuck.
          </p>
          <button on:click={nextPlayer}>Next Player</button>
        </div>
      {/if}
    </div>
  {/if}
</div>
