<script>
  export let madlib = null;
  export let appInterface = null;
  export let state = null;
  export let players = null;

  import Hoverable from "./Hoverable.svelte";
  import { MADLIBS_DATA } from "./MadlibsData";
  import _ from "lodash";
  import { blank_object } from "svelte/internal";
  function getSelectedMadlib() {
    return _.find(MADLIBS_DATA, ["id", state.selectedMadlib]);
  }
  let selectedMadlib = getSelectedMadlib();
</script>

<div>
  {#each state.blanks as blank (blank.id)}
    <span>
      {selectedMadlib.value[blank.id]}
      <Hoverable normal={blank.word} hover={blank.owner} />
    </span>
  {/each}
</div>
