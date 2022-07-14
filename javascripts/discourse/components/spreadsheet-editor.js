// import Controller from "@ember/controller";
import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { tableToObj } from "../lib/utilities";
import Component from "@ember/component";

export default Component.extend({
  tagName: "",

  didInsertElement() {
    this._super(...arguments);

    this.loadLibraries().then(() => {
      this.buildTable(this.tableHtml);
    });
  },

  loadLibraries() {
    return loadScript(settings.theme_uploads.jsuites).then(() => {
      return loadScript(settings.theme_uploads.jspreadsheet);
    });
  },

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
        width: heading.length * 15,
      };
    });

    const spreadsheetContainer = document.querySelector("#spreadsheet");

    // eslint-disable-next-line no-undef
    this.spreadsheet = jspreadsheet(spreadsheetContainer, {
      data: tableData,
      columns,
    });

    const originalData = this.spreadsheet.getData();
    console.log("Original Data:", originalData);
  },

  @action
  cancelTableEdit() {
    this.triggerModalClose();
  },

  @action
  editTable() {
    // TODO: insert table edit submission logic
    console.log("New Data:", this.spreadsheet.getData());
    this.triggerModalClose();
  },
});
