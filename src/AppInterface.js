// import Automerge from "automerge";
import { createSignal } from "strong-events";

export class AppInterface {
  static DEV_DESTINATION_URL = "http://localhost:3000";
  static PROD_DESTINATION_URL = "https://go.elsewhere.zone";

  constructor() {
    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("appId")) {
      this.appId = urlParams.get("appId");
    } else {
      throw new Error("appId param missing!");
    }
    if (urlParams.get("appHost")) {
      this.appHost = urlParams.get("appHost");
    }
    if (urlParams.get("debug")) {
      this.debug = true;
    }
    this.onChange = createSignal();
    this.onLoad = createSignal();
    this.onPlayerJoined = createSignal();
    this.onPlayerLeft = createSignal();
    this.onGetPlayersPromises = [];
    this.receivedInitialState = false;
    window.addEventListener("message", this._onMessage.bind(this));
  }
  isDev() {
    return window.location.hostname === "localhost";
  }
  getDestinationURL() {
    if (this.appHost) {
      return this.appHost;
    }
    return this.isDev()
      ? AppInterface.DEV_DESTINATION_URL
      : AppInterface.PROD_DESTINATION_URL;
  }
  async getPlayers() {
    this.sendMessageType("get_players");
    const promiseObj = {};
    // FIXME: I'm likely abusing promises here -- what's the right way?
    const newPromise = new Promise((resolve, reject) => {
      promiseObj.resolve = resolve;
      promiseObj.reject = reject;
    });
    promiseObj.promise = newPromise;
    this.onGetPlayersPromises.push(promiseObj);
    return newPromise;
  }
  _onMessage(message) {
    if (message.origin !== this.getDestinationURL()) {
      return;
    }
    if (this.debug) {
      console.log(`_onMessage`, message.data);
    }
    switch (message.data.type) {
      case 'change':
        this.onChange.invoke(message.data.data, message.data.changes);
        break;
      case 'load':
        this.receivedInitialState = true;
        // this.automergeDoc = Automerge.from(
        //   JSON.parse(message.data.automergeData)
        // );
        this.onLoad.invoke(message.data.data);
        break;
      case 'get_players':
        this.onGetPlayersPromises.forEach((promiseObj) => {
          promiseObj.resolve(message.data.data);
          this.onGetPlayersPromises = [];
        });
        break;
      case 'player_joined':
        this.onPlayerJoined.invoke(message.data.data);
        break;
      case 'player_left':
        this.onPlayerLeft.invoke(message.data.data);
        break;
    }
  }
  postMessage(data) {
    if (!this.appId) {
      throw new Error("appId not set!");
    }
    parent.postMessage(
      JSON.stringify({
        appId: this.appId,
        data,
      }),
      this.getDestinationURL()
    );
  }
  setFrameHeight(height) {
    this.sendMessageType("set_frame_height", "height", height);
  }
  sendMessageType(type, key, value) {
    this.postMessage({
      type: type,
      data: {
        key,
        value,
      },
    });
  }
  update(key, value) {
    this.sendMessageType("update", key, value);
  }
  updateAutomerge(cb) {
    // const newDoc = Automerge.change(this.automergeDoc, cb);
    // const changes = Automerge.getChanges(this.automergeDoc, newDoc);
    // this.sendMessageType("update_automerge", "changes", changes);
    // // TODO: Is it sufficient to just do this.automergeDoc = newDoc?
    // this.automergeDoc = Automerge.applyChanges(this.automergeDoc, changes);
  }
  announce(message) {
    this.sendMessageType("announce", "message", message);
  }
}
