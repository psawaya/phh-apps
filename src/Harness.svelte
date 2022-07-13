<script>
  import _ from "lodash";
  import { PLAYER_NAMES } from "./seed";

  let loaded = false;
  let allPlayers = [];
  let originalUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/?appName=blackjack' : 'https://apps.elsewhere.zone/?appName=blackjack';
  let appUrl = '';
  let appId = '123';
  let appData = {};
  let baseDomain = '';

  const configureApp = () => {
    const parsed = new URL(originalUrl);
    baseDomain = `${parsed.protocol}//${parsed.host}`;
    appUrl = originalUrl;
    if (!parsed.searchParams.get('appId')) {
      addUrlParam('appId', appId);
    } else {
      appId = parsed.searchParams.get('appId');
    }
    if (!parsed.searchParams.get('appHost')) {
      const harnessLocation = new URL(window.location);
      const appHost = `${harnessLocation.protocol}//${harnessLocation.host}`;
      console.log(`appHost: ${appHost}`);
      addUrlParam('appHost', appHost, false);
    }
    // if (!parsed.searchParams.get('debug')) {
    //   console.log('debug enabled');
    //   addUrlParam('debug', 'true');
    // }

    appData = {};
    window.addEventListener('message', appListener);

    loaded = true;
  };

  const refreshAllFrames = () => {
    for (const player of allPlayers) {
      const frame = document.getElementById(`app${player.id}`);
      frame.src = frame.src;
    }
  };

  const reset = () => {
    allPlayers = [];
    appData = {};
    appUrl = '';
    baseDomain = '';
    window.removeEventListener('message', appListener);
    loaded = false;
  };

  const addUrlParam = (key, value, encode = true) => {
    if (appUrl.indexOf('?') < 0) {
      appUrl += '?';
    } else {
      appUrl += '&';
    }
    if (encode) {
      appUrl += `${key}=${encodeURIComponent(value)}`;
    } else {
      appUrl += `${key}=${value}`;
    }
  };
  const mapPlayer = (player, localPlayer) => {
    return {
      id: player.id,
      sessionId: player.id,
      name: player.name,
      localPlayer,
    };
  };

  const appStart = (id) => {
    appPostMessage(id, {
      type: 'load',
      data: appData,
    });
  };
  const appPlayerJoin = () => {
    const newPlayer = { id: new Date().getTime(), name: _.sample(PLAYER_NAMES) };

    const data = mapPlayer(newPlayer, false);
    for (const player of allPlayers) {
      appPostMessage(player.id, { type: 'player_joined', data });
    }

    // Let Svelte know this has been updated
    allPlayers = [...allPlayers, newPlayer];
  };
  const appPlayerLeave = (id) => {
    const removed = _.find(allPlayers, { id });
    if (!removed) {
      console.log('Player left not found', id);
      return;
    }
    allPlayers = _.reject(allPlayers, { id });
    const data = mapPlayer(removed, false);
    for (const player of allPlayers) {
      console.log(`Notifying ${player.name} that ${removed.name} left`);
      appPostMessage(player.id, { type: 'player_left', data });
    }
  };
  const appPostMessage = (id, data) => {
    const iFrame = document.getElementById(`app${id}`);
    if (iFrame) {
      iFrame.contentWindow.postMessage(data, baseDomain);
    } else {
      console.log(`app${id} was not found`);
    }
  };
  const appListener = (msg) => {
    if (msg.origin !== baseDomain) {
      return;
    }
    if (typeof msg.data !== 'string') {
      return;
    }
    const msgData = JSON.parse(msg.data);
    // Ignore message intended for other appId
    if (msgData.appId !== appId.toString()) {
      return;
    }

    const source = Array.from(document.getElementsByTagName('iframe')).filter(iframe => {
      return iframe.contentWindow === msg.source;
    })[0];
    const localPlayerId = source.id.replace('app', '') * 1;

    switch (msgData.data.type) {
      case 'update':
        const { key, value } = msgData.data.data;
        if (key) {
          appData[key] = value;
          // Also, post a change event to each of the players
          for (const player of allPlayers) {
            // console.log(`Notifying ${player.name} of change to ${key}`);
            appPostMessage(player.id, { type: 'change', data: appData });
          }
        }
        break;
      case 'get_players':
        const playersData = allPlayers.map((player) => mapPlayer(player, localPlayerId === player.id));
        appPostMessage(localPlayerId, {
          type: 'get_players',
          data: playersData,
        });
        break;
      case 'announce':
      case 'set_frame_height':
        // Unsupported.
        // Formerly, Elsewhere v1 allowed apps to announce a message via snackbar to an entire space.
        // Or directly set their iframe height in pixels.
        break;
      default:
        console.log(`unhandled message: ${msgData.data.type}`);
        break;
    }
  };
</script>
<style>
.row {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;

  color: #333;
  gap: 10px;
}
h3 {
  color: #333;
}
</style>
{#if !loaded}
<div class="row">
  <div style="vertical-align: middle; line-height: 32px;">ApplicationURL:</div>
  <input type="text" placeholder="Application URL" style="width: 500px" bind:value={originalUrl} />
  <button on:click={configureApp}>Configure</button>
</div>
{/if}
{#if loaded}
<div class="row">
  <button on:click={appPlayerJoin}>Simulate Player Joining</button>
  <button on:click={refreshAllFrames}>Refresh all Frames</button>
  <button on:click={reset}>Reset</button>
</div>
<div>
  <textarea readonly style="width: 100%" rows="10">{JSON.stringify(appData, null, 2)}</textarea>
  {#each allPlayers as player}
    <div class="frame">
      <h3>{player.name} <button on:click={appPlayerLeave.bind(this, player.id)}>Leave</button></h3>
      <iframe src="{appUrl}" style="width: 100%;" on:load={appStart.bind(this, player.id)} id="app{player.id}" title="{player.name}">
      </iframe>
    </div>
  {/each}
</div>
{/if}
