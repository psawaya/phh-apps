<script>
  import { AppInterface } from './AppInterface';

  const appInterface = new AppInterface();
  let loaded = false;
  let arePlayersLoaded = false;

  let players = [];
  let gamePlayers = [];
  let localPlayer = null;
  let currentPlayer = 0;
  let gameState = 'off';

  let dealer = { points: 0, hand: [] };

  const CARD_SUITS = ['S', 'H', 'D', 'C'];
  const CARD_VALUES = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  let deck = [];

  const createDeck = () => {
    deck = [];
    for (const value of CARD_VALUES) {
      for (const suit of CARD_SUITS) {
        let weight;
        switch (value) {
          case 'J':
          case 'Q':
          case 'K':
            weight = 10;
            break;
          case 'A':
            weight = 11;
            break;
          default:
            weight = parseInt(value, 10);
            break;
        }
        const card = { value, suit, weight };
        deck.push(card);
      }
    }
  };
  const shuffle = () => {
    for (let i = 0; i < 1000; i++) {
      const location1 = Math.floor(Math.random() * deck.length);
      const location2 = Math.floor(Math.random() * deck.length);
      const tmp = deck[location1];
      deck[location1] = deck[location2];
      deck[location2] = tmp;
    }
    appInterface.update('deck', deck);
  };
  const createPlayers = () => {
    for (let i = 0; i < players.length; i++) {
      const player = {
        name: players[i].name,
        id: players[i].id,
        sessionId: players[i].sessionId,
        points: 0,
        hand: [],
        state: 'playing',
        result: null,
      };
      gamePlayers.push(player);
    }
  };
  const dealHands = () => {
    for (let i = 0; i < 2; i++) {
      for (let x = 0; x < gamePlayers.length; x++) {
        const card = deck.pop();
        gamePlayers[x].hand.push(card);
      }
    }
    for (let i = 0; i < 2; i++) {
      const card = deck.pop();
      dealer.hand.push(card);
    }
    appInterface.update('deck', deck);
  };
  const hitMe = () => {
    const card = deck.pop();
    gamePlayers[currentPlayer].hand.push(card);
    appInterface.update('gamePlayers', gamePlayers);
    appInterface.update('deck', deck);
    updatePoints();
  };
  const hitDealer = () => {
    const card = deck.pop();
    dealer.hand.push(card);
    checkDealer();
    appInterface.update('deck', deck);
  };
  const stay = () => {
    nextPlayer();
  };
  const updatePoints = () => {
    let playerScore = 0;
    let hasAce = false;
    for (let x = 0; x < gamePlayers[currentPlayer].hand.length; x++) {
      playerScore = playerScore + gamePlayers[currentPlayer].hand[x].weight;
      if (gamePlayers[currentPlayer].hand[x].weight * 1 === 11) {
        hasAce = true;
      }
    }
    gamePlayers[currentPlayer].points = playerScore;
    appInterface.update('gamePlayers', gamePlayers);
    if (playerScore > 20) {
      if (hasAce && playerScore === 21) {
        nextPlayer();
      } else if (hasAce && playerScore > 21) {
        playerScore -= 10;
        gamePlayers[currentPlayer].points = playerScore;
        appInterface.update('gamePlayers', gamePlayers);
        if (playerScore > 20) {
          nextPlayer();
        }
      } else {
        nextPlayer();
      }
    }
  };
  const nextPlayer = () => {
    if (currentPlayer < gamePlayers.length - 1) {
      currentPlayer++;
      updatePoints();
      if (gamePlayers[currentPlayer].state !== 'playing') {
        nextPlayer();
      } else {
        appInterface.update('currentPlayer', currentPlayer);
      }
    } else {
      checkDealer();
    }
  };
  const checkDealer = () => {
    let dealerScore = 0;
    let dealerAce = false;
    for (let x = 0; x < dealer.hand.length; x++) {
      dealerScore = dealerScore + dealer.hand[x].weight;
      if (dealer.hand[x].weight * 1 === 11) {
        dealerAce = true;
      }
    }
    if (dealerAce && dealerScore > 21) {
      dealerScore -= 10;
    }
    dealer.points = dealerScore;
    appInterface.update('dealer', dealer);
    if (dealerScore < 17) {
      hitDealer();
    } else {
      compareHands();
    }
  };
  const compareHands = () => {
    for (let x = 0; x < gamePlayers.length; x++) {
      let playerPoints = gamePlayers[x].points * 1;
      let dealerPoints = dealer.points;
      if (playerPoints > 21) {
        gamePlayers[x].result = 'lose';
      } else if (dealerPoints > 21) {
        gamePlayers[x].result = 'win';
      } else if (dealerPoints === 21) {
        if (playerPoints === 21) {
          gamePlayers[x].result = 'tie';
        } else {
          gamePlayers[x].result = 'lose';
        }
      } else if (dealer.points < playerPoints) {
        gamePlayers[x].result = 'win';
      } else {
        gamePlayers[x].result = 'lose';
      }
    }
    appInterface.update('gamePlayers', gamePlayers);
    gameState = 'off';
    appInterface.update('gameState', gameState);
  };
  const restartGame = () => {
    gamePlayers = [];
    deck = [];
    dealer = { points: 0, hand: [] };
    currentPlayer = 0;

    appInterface.update('gamePlayers', gamePlayers);
    appInterface.update('deck', deck);
    appInterface.update('dealer', dealer);
    appInterface.update('currentPlayer', currentPlayer);

    createDeck();
    shuffle();
    createPlayers();
    dealHands();
    updatePoints();

    appInterface.update('gameState', 'on');
    appInterface.update('gamePlayers', gamePlayers);
    appInterface.update('dealer', dealer);
    console.log('restarting game........');
  };
  const updateGame = (state) => {
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
  };

  appInterface.onChange(updateGame);
  appInterface.onLoad((state) => {
    updateGame(state);
    loaded = true;
  });
  appInterface.onPlayerJoined((player) => {
    if (!player) {
      return;
    }

    switch (gameState) {
      case 'on':
        // Preemptively add them to players (if they don't exist already)
        if (!players.some((p) => p && p.id === player.id)) {
          players.push(player);
        }

        // Add them to the gamePlayers list but as inactive
        const existing = gamePlayers.find((p) => p && p.id === player.id);
        if (existing) {
          existing.state = 'waiting';
        } else {
          const gamePlayer = {
            name: player.name,
            id: player.id,
            sessionId: player.sessionId,
            points: 0,
            hand: [],
            state: 'waiting',
            result: null,
          };
          gamePlayers.push(gamePlayer);
        }
        appInterface.update('gamePlayers', gamePlayers);
        break;
      case 'off':
        // Reload the players list
        loadPlayers();
        break;
    }
  });
  appInterface.onPlayerLeft(({ sessionId }) => {
    if (!sessionId) {
      return;
    }

    switch (gameState) {
      case 'on':
        // Preemptively remove them from players
        players = players.filter((p) => p && p.sessionId !== sessionId);

        // If they exist in the gamePlayers list then mark them as inactive
        const gamePlayer = gamePlayers.find(
          (p) => p && p.sessionId === sessionId
        );
        if (gamePlayer) {
          gamePlayer.state = 'left';
          appInterface.update('gamePlayers', gamePlayers);

          // If they are the active player then move to the next player
          if (
            !gamePlayers[currentPlayer] ||
            gamePlayers[currentPlayer].id === gamePlayer.id
          ) {
            nextPlayer();
          }
        }
        break;
      case 'off':
        // Reload the players list
        loadPlayers();
        break;
    }
  });
  const loadPlayers = async () => {
    players = (await appInterface.getPlayers()).filter((x) => !!x);
    localPlayer = players.find((player) => player.localPlayer);
    arePlayersLoaded = true;
  };
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
    background-color: whitesmoke;
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
          {#if gameState === 'off'}
            <button on:click={restartGame}>START</button>
          {:else}
            <b>{gamePlayers[currentPlayer].name}'s turn</b>
          {/if}
        </div>
        {#each gamePlayers as player}
          <div class="player">
            <b>{player.name} - {player.points}</b>
            {#if player.state === 'playing'}
              {#each player.hand as hand}
                {#if hand.value * 1 === 10}
                  <img
                    class="card"
                    alt="0{hand.suit}"
                    src="https://deckofcardsapi.com/static/img/0{hand.suit}.png" />
                {:else}
                  <img
                    class="card"
                    alt="{hand.value}{hand.suit}"
                    src="https://deckofcardsapi.com/static/img/{hand.value}{hand.suit}.png" />
                {/if}
              {/each}
              <b>
                {#if player.result}{player.result}{/if}
              </b>
              {#if gamePlayers[currentPlayer] && gamePlayers[currentPlayer].id === localPlayer.id}
                {#if gameState !== 'off'}
                  {#if player.id === localPlayer.id}
                    <div class="controls">
                      <button on:click={hitMe}>Hit</button>
                      <button on:click={stay}>Stay</button>
                    </div>
                  {/if}
                {/if}
              {/if}
            {/if}
            {#if player.state === 'left'}
              <b>Left round</b>
            {/if}
            {#if player.state === 'waiting'}
              <b>
                Waiting for
                <br />
                next round
              </b>
            {/if}
          </div>
        {/each}
        <div class="player dealer">
          {#if dealer.points}
            <b>dealer - {dealer.points}</b>
            {#each dealer.hand as card}
              {#if card.value * 1 === 10}
                <img
                  class="card"
                  alt="0{card.suit}"
                  src="https://deckofcardsapi.com/static/img/0{card.suit}.png" />
              {:else}
                <img
                  class="card"
                  alt="{card.value}{card.suit}"
                  src="https://deckofcardsapi.com/static/img/{card.value}{card.suit}.png" />
              {/if}
            {/each}
          {:else}
            <b>dealer</b>
            {#if dealer.hand[0]}
              {#if dealer.hand[0].value * 1 === 10}
                <img
                  class="card"
                  alt="0{dealer.hand[0].suit}"
                  src="https://deckofcardsapi.com/static/img/0{dealer.hand[0].suit}.png" />
              {:else}
                <img
                  class="card"
                  alt="{dealer.hand[0].value}{dealer.hand[0].suit}"
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
