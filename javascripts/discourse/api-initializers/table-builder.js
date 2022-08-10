import { apiInitializer } from "discourse/lib/api";
import { action } from "@ember/object";
import showModal from "discourse/lib/show-modal";

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("controller:composer", {
    pluginId: "discourse-table-builder",

    @action
    showTableBuilder() {
      showModal("insert-table-modal").setProperties({
        toolbarEvent: this.toolbarEvent,
        tableTokens: null,
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
