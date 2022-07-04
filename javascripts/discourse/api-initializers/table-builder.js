import { apiInitializer } from "discourse/lib/api";
import { action } from "@ember/object";
import showModal from "discourse/lib/show-modal";

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("component:d-editor", {
    pluginId: "discourse-table-builder",

    @action
    showTableBuilder(event) {
      showModal("table-builder-modal").set("toolbarEvent", event);
    },
  });

  api.onToolbarCreate((toolbar) => {
    toolbar.addButton({
      id: "table-builder",
      group: "insertions",
      icon: "table",
      sendAction: (event) => toolbar.context.send("showTableBuilder", event),
      title: themePrefix("discourse_table_builder.composer.button"),
    });
  });
});
