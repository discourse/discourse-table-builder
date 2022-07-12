import Controller from "@ember/controller";
import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { tableToObj } from "../lib/utilities";

export default class extends Controller {
  onShow() {
    // ? TODO move to component (read about not allowing Controllers to do DOM manipulation)
    this._super(...arguments);

    loadScript(settings.theme_uploads.importabular).then(() => {
      this.buildTable(this.tableHtml);
    });
  }

  buildTable(table) {
    const tableObject = tableToObj(table);
    const headings = [];
    const tableData = [];
    tableObject.forEach((object) => {
      // Build Headings
      if (!headings.includes(...Object.keys(object))) {
        headings.push(...Object.keys(object));
      }

      tableData.push([...Object.values(object)]);
    });

    const columns = headings.map((heading) => {
      return {
        label: heading,
      };
    });

    // eslint-disable-next-line no-unused-vars, no-undef
    const sheet = new Importabular({
      node: document.getElementById("table-editor-spreadsheet"),
      columns,
      data: tableData,
      width: "100vw",
    });
  }

  @action
  cancelTableEdit() {
    this.send("closeModal");
  }

  @action
  editTable() {
    // TODO: insert table edit submission logic
    this.send("closeModal");
  }
}
