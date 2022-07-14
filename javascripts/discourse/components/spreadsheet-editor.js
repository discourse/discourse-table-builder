// import Controller from "@ember/controller";
import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { tableToObj } from "../lib/utilities";
import Component from "@ember/component";

export default Component.extend({
  tagName: "",

  didInsertElement() {
    this._super(...arguments);

    // ? TODO move to component (read about not allowing Controllers to do DOM manipulation)
    this._super(...arguments);

    loadScript(settings.theme_uploads.jspreadsheet).then(() => {
      this.buildTable(this.tableHtml);
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
        width: "100", // TODO make based on string length?
      };
    });

    const spreadsheetContainer = document.querySelector("#spreadsheet");

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
