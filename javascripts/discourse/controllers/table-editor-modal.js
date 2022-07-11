import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { A } from "@ember/array";

export default class extends Controller {
  @action
  cancelTableEdit() {
    this.send("closeModal");
  }

  @action
  editTable() {
    // TODO: insert table edit submission logic
    console.log("Table has been successfully edited");
    this.send("closeModal");
  }
}
