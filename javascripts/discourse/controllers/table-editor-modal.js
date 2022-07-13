import Controller from "@ember/controller";
import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { tableToObj } from "../lib/utilities";

export default class extends Controller {
  onShow() {
    // ? TODO move to component (read about not allowing Controllers to do DOM manipulation)
    this._super(...arguments);

    loadScript(settings.theme_uploads.jspreadsheet).then(() => {
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

      // Build Table Data
      tableData.push([...Object.values(object)]);
    });

    const columns = headings.map((heading) => {
      return {
        title: heading,
        width: "100", // TODO make based on string length?
      };
    });

    this.spreadsheet = jspreadsheet(document.getElementById("spreadsheet"), {
      data: tableData,
      columns,
    });

    const originalData = this.spreadsheet.getData();
    console.log("Original Data:", originalData);
  }

  @action
  cancelTableEdit() {
    this.send("closeModal");
  }

  @action
  editTable() {
    // TODO: insert table edit submission logic
    console.log("New Data:", this.spreadsheet.getData());
    this.send("closeModal");
  }
}
