import Controller from "@ember/controller";
import { action } from "@ember/object";

export default class extends Controller {
  @action
  closeEditModal() {
    this.send("closeModal");
  }
}
