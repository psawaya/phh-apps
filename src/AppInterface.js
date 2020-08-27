// import Automerge from "automerge";
import { createSignal } from "strong-events";

export class AppInterface {
  static DEV_DESTINATION_URL = "http://localhost:3000";
  static PROD_DESTINATION_URL = "https://elsewhere.zone";

  constructor() {
    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("appId")) {
      this.appId = urlParams.get("appId");
    } else {
      throw new Error("appId param missing!");
    }
    this.onChange = createSignal();
    this.onLoad = createSignal();
    this.onGetPlayersPromises = [];
    this.receivedInitialState = false;
    window.addEventListener("message", this._onMessage.bind(this));
  }
  isDev() {
    return window.location.hostname === "localhost";
  }
  getDestinationURL() {
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
    console.log(`_onMessage`, message.data);
    if (message.data.type === "change") {
      this.onChange.invoke(message.data.data, message.data.changes);
    } else if (message.data.type === "load") {
      this.receivedInitialState = true;
      // this.automergeDoc = Automerge.from(
      //   JSON.parse(message.data.automergeData)
      // );
      this.onLoad.invoke(message.data.data);
    } else if (message.data.type === "get_players") {
      this.onGetPlayersPromises.forEach((promiseObj) => {
        promiseObj.resolve(message.data.data);
        this.onGetPlayersPromises = [];
      });
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
