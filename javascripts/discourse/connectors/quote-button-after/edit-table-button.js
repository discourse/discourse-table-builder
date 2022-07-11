import { action } from "@ember/object";
import showModal from "discourse/lib/show-modal";

export default {
  setupComponent(args, component) {
    console.log(args, component, this);
  },

  @action
  showEditTableModal() {
    const selection = window.getSelection();
    const selectedTable = selection.focusNode;
    const { context } = this.args;

    // TODO: Improve table checking logic AND change so it only shows button when selected content is a table
    if (
      selectedTable.nodeName === "DIV" &&
      selectedTable.classList.contains("md-table")
    ) {
      // ? TODO: simply pass quoteState object only?
      const attrs = {
        table: context.quoteState.buffer,
        postId: context.quoteState.postId,
      };
      showModal("table-editor-modal", {
        model: attrs,
      });
    } else {
      console.warn("This is not a table:", selection);
    }
  },
};
