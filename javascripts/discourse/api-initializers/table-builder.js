import { apiInitializer } from "discourse/lib/api";
import SpreadsheetEditor from "../components/spreadsheet-editor";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("controller:composer", {
    pluginId: "discourse-table-builder",
    modal: service(),

    @action
    showTableBuilder() {
      this.modal.show(SpreadsheetEditor, {
        model: {
          toolbarEvent: this.toolbarEvent,
          tableTokens: null,
        },
      });
    },
  });

  api.addToolbarPopupMenuOptionsCallback(() => {
    return {
      id: "table-builder",
      action: "showTableBuilder",
      icon: "table",
      label: themePrefix("discourse_table_builder.composer.button"),
    };
  });
});
