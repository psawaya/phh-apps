import { createSignal } from "strong-events";

export class AppInterface {
  static DEV_DESTINATION_URL = "http://localhost:3000";
  static PROD_DESTINATION_URL = "https://pixelhappyhour.herokuapp.com";

  constructor() {
    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("appId")) {
      this.appId = urlParams.get("appId");
    } else {
      throw new Error("appId param missing!");
    }
    this.onChange = createSignal();
    this.onLoad = createSignal();
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
  _onMessage(message) {
    if (message.origin !== this.getDestinationURL()) {
      return;
    }
    console.log(`_onMessage`, message.data);
    if (message.data.type === "change") {
      this.onChange.invoke(message.data.data, message.data.changes);
    } else if (message.data.type === "load") {
      this.receivedInitialState = true;
      this.onLoad.invoke(message.data.data);
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
  update(key, value) {
    this.postMessage({
      type: "update",
      data: {
        key,
        value,
      },
    });
  }
}
