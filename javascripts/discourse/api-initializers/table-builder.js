import { apiInitializer } from "discourse/lib/api";
import SpreadsheetEditor from "../components/spreadsheet-editor";

export default apiInitializer("1.13.0", (api) => {
  const modal = api.container.lookup("service:modal");

  api.addComposerToolbarPopupMenuOption({
    icon: "table",
    label: themePrefix("discourse_table_builder.composer.button"),
    action: (toolbarEvent) => {
      modal.show(SpreadsheetEditor, {
        model: {
          toolbarEvent,
          tableTokens: null,
        },
      });
    },
  });
});
