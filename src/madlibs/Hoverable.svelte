<script>
  let hovering;

  export let normal = "";
  export let hover = "";

  function enter() {
    hovering = true;
  }

  function leave() {
    hovering = false;
  }
</script>

<strong on:mouseenter={enter} on:mouseleave={leave}>
  {#if hovering}{hover}{:else}{normal}{/if}
</strong>
