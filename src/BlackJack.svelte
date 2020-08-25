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
    var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    var deck = new Array();

    function createDeck()
    {
        deck = new Array();
        for (var i = 0 ; i < values.length; i++)
        {
            for(var x = 0; x < suits.length; x++)
            {
                var weight = parseInt(values[i]);
                if (values[i] == "J" || values[i] == "Q" || values[i] == "K")
                    weight = 10;
                if (values[i] == "A")
                    weight = 11;
                var card = { value: values[i], suit: suits[x], weight: weight };
                deck.push(card);
            }
        }
    }

    function shuffle()
        {
            // for 1000 turns
            // switch the values of two random cards
            for (var i = 0; i < 1000; i++)
            {
                var location1 = Math.floor((Math.random() * deck.length));
                var location2 = Math.floor((Math.random() * deck.length));
                var tmp = deck[location1];

                deck[location1] = deck[location2];
                deck[location2] = tmp;
            }
            appInterface.update("deck", deck);
        }
    function createPlayers() {
        for(var i = 0; i < filtered.length; i++)
               {
                   var hand = new Array();
                   var player = { name: filtered[i].name, points: 0, hand: hand, result: null };
                   gamePlayers.push(player);
               }
    }

    function dealHands(){
       for(var i = 0; i < 2; i++)
        {
            for (var x = 0; x < gamePlayers.length; x++)
            {
                var card = deck.pop();
                gamePlayers[x].hand.push(card);

            }
        }
        for(var i = 0; i < 2; i++)
            {
                var card = deck.pop();
                dealer.hand.push(card);
            }
        appInterface.update("deck", deck);
    }
    function hitMe()
        {
            var card = deck.pop();
            gamePlayers[currentPlayer].hand.push(card);
            appInterface.update("gamePlayers", gamePlayers);
            appInterface.update("deck", deck);
            updatePoints();
            console.log("HITTING.......");
    }
    function hitDealer()
        {
            var card = deck.pop();
            dealer.hand.push(card);
            checkDealer();
            appInterface.update("deck", deck);
        }
    function stay() {
        nextPlayer();
    }
    function updatePoints () {
        console.log("updating points.........");
        var playerScore = 0;
        var hasAce = false;
        for (var x = 0; x < gamePlayers[currentPlayer].hand.length; x++) {
            playerScore = playerScore + gamePlayers[currentPlayer].hand[x].weight;
            if (gamePlayers[currentPlayer].hand[x].weight == 11 ) {
                hasAce = true;
                console.log("ace detected");
            }
        }
        gamePlayers[currentPlayer].points = playerScore;
        appInterface.update("gamePlayers", gamePlayers);
        if (playerScore > 20) {
            if (hasAce == true && playerScore == 21) {
              nextPlayer();
            }
            else if (hasAce == true && playerScore > 21) {
                playerScore -= 10;
                console.log("subtracting 10...");
                gamePlayers[currentPlayer].points = playerScore;
                appInterface.update("gamePlayers", gamePlayers);
                if (playerScore > 20) {
                    nextPlayer();
                }
            }
            else {
                nextPlayer();
            }
        }

    }
      function nextPlayer() {
        console.log("next player........");
        if (currentPlayer < (filtered.length - 1)) {
            currentPlayer++;
            updatePoints();
        }
        else {
            checkDealer();
        }
        appInterface.update("currentPlayer", currentPlayer);

      }
    function checkDealer() {
        var dealerScore = 0;
        var dealerAce = false;
        for (var x = 0; x < dealer.hand.length; x++) {
          dealerScore = dealerScore + dealer.hand[x].weight;
          if (dealer.hand[x].weight == 11 ) {
              dealerAce = true;
              console.log("dealer ace detected");
          }
        }
        if (dealerAce = true && dealerScore > 21) {
            dealerScore -= 10;
            console.log("subtracting 10 from dealer.......");
        }
        dealer.points = dealerScore;
        appInterface.update("dealer", dealer);
        if (dealerScore < 17) {
            hitDealer();
        }
        else {
            compareHands();
        }
    }
    function compareHands() {
       for (var x = 0; x < gamePlayers.length; x++)
        {
            var playerPoints = gamePlayers[x].points;
            var dealerPoints = dealer.points;
            if (playerPoints > 21) {
                gamePlayers[x].result = "lose";
            }
            else if (dealerPoints > 21) {
                gamePlayers[x].result = "win";
            }
            else if (dealerPoints == 21) {
                if (playerPoints == 21) {
                    gamePlayers[x].result = "tie";
                }
                else {
                    gamePlayers[x].result = "lose";
                }
            }
            else if (dealer.points < playerPoints) {
                gamePlayers[x].result = "win";
            }
            else {
                gamePlayers[x].result = "lose";
            }
        }
        appInterface.update("gamePlayers", gamePlayers);
        gameState = "off";
        appInterface.update("gameState", "off");
    }

    function startGame() {
        createDeck();
        shuffle();
        createPlayers();
        dealHands();
        updatePoints();
        gameState = "on";
        appInterface.update("gameState", "on");
        appInterface.update("gamePlayers", gamePlayers);
        appInterface.update("dealer", dealer);
    }
    function restartGame() {
        gamePlayers = [];
        deck = [];
        dealer = { points: 0, hand: [] };
        appInterface.update("gamePlayers", []);
        appInterface.update("deck", []);
        appInterface.update("dealer", {points: 0, hand: []});
        createDeck();
        shuffle();
        createPlayers();
        dealHands();
        currentPlayer = 0;
        updatePoints();
        appInterface.update("gameState", "on");
        appInterface.update("gamePlayers", gamePlayers);
        appInterface.update("dealer", dealer);
        appInterface.update("currentPlayer", 0);
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
    }
  appInterface.onChange(updateGame);
  appInterface.onLoad((state) => {
    updateGame(state);
    loadPlayers();
    loaded = true;
  });
  async function loadPlayers() {
    players = await appInterface.getPlayers();
    var filteredList = players.data;
    filtered = filteredList.filter(function(x) {
       return x !== undefined;
    });
    arePlayersLoaded = true;
    localPlayer = filtered.find(player => player.localPlayer == true);
  }
</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
  <div style="font-size:12px;">
      {#if !arePlayersLoaded}
        Loading...
      {:else}


             {#if gameState == "off"}
             <button on:click={restartGame}>
                RESTART
             </button>
            {:else}

                 <button on:click={hitMe}>
                     HIT ME
                </button>
                <button on:click={stay}>
                     STAY
                </button>
                <b>{gamePlayers[currentPlayer].name}'s turn</b>
             {/if}
             {#each gamePlayers as player}
                <p>
                {player.name} - {player.points} - {player.result}
                    {#each player.hand as hand}
                        {#if hand.value == 10}
                             {hand.value}{hand.suit}, {hand.weight} - <img src="https://deckofcardsapi.com/static/img/0{hand.suit}.png" height="30">
                        {:else}
                         {hand.value}{hand.suit}, {hand.weight} - <img src="https://deckofcardsapi.com/static/img/{hand.value}{hand.suit}.png" height="30">
                        {/if}
                    {/each}
                </p>
             {/each}
             <b>dealer - {dealer.points}</b>
             {#each dealer.hand as card}
                    {#if card.value == 10}
                      {card.value}{card.suit}, {card.weight} - <img src="https://deckofcardsapi.com/static/img/0{card.suit}.png" height="30">
                    {:else}
                      {card.value}{card.suit}, {card.weight} - <img src="https://deckofcardsapi.com/static/img/{card.value}{card.suit}.png" height="30">
                    {/if}
             {/each}

      {/if}
  </div>
{/if}
