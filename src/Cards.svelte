<script>
  import { AppInterface } from "./AppInterface";
  import _ from "lodash";
  import App from "./App.svelte";

  const appInterface = new AppInterface();

  let loaded = false;

  let cardNext = null;
  let cardLast = null;



  function updateCard(state) {
    if (state.cardNext) {
      cardNext = state.cardNext;
    }
    if (state.cardLast) {
      cardLast = state.cardLast;
    }
  }
  appInterface.onChange(updateCard);
  appInterface.onLoad((state) => {
    draw()
    updateCard(state);
    loaded = true;
  });



  function draw () {

    console.log("draw!");
    fetch('https://deckofcardsapi.com/api/deck/new/draw/')
        .then(res => res.json())
        .then(data => cardNext = data)
        .then(() => console.log(cardNext))

     if (cardNext) {
             cardLast = cardNext;
         }
     appInterface.update("cardLast", cardLast);
     appInterface.update("cardNext", cardNext);
  }

</script>

{#if !loaded}
  <div>Loading...</div>
{:else}
  <div style="height: 150px">
      <div style="display:inline-block; margin-right: 10px;">
        <button on:click={draw}>
          Draw
        </button>
      </div>
      {#if cardNext}
          <div style="display:inline-block; margin-right: 10px;">
              <img src={cardNext.cards[0].image} height="100">
              <h3 style="margin:0;text-align: center;">{cardNext.cards[0].code}</h3>
          </div>
      {/if}
      {#if cardLast}
          <div style="display:inline-block">
              <img src={cardLast.cards[0].image} height="90">
              <h4 style="margin:0;text-align: center;">Last: {cardLast.cards[0].code}</h4>
          </div>
      {/if}
  </div>
{/if}
