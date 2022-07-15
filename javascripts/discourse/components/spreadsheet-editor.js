// import Controller from "@ember/controller";
import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { arrayToTable, tableToObj } from "../lib/utilities";
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
    console.log(this.model.id);
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
    const updatedHeaders = this.spreadsheet.getHeaders().split(","); // keys
    const updatedData = this.spreadsheet.getData(); // values

    const markdownTable = this.buildTableMarkdown(updatedHeaders, updatedData);
    this.triggerModalClose();
  },

  buildTableMarkdown(headers, data) {
    const table = [];
    data.forEach((row) => {
      const result = {};

      headers.forEach((key, index) => (result[key] = row[index]));
      table.push(result);
    });

    return arrayToTable(table);
  },
});
