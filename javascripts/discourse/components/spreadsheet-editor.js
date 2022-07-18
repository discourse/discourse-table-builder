// import Controller from "@ember/controller";
import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { arrayToTable, findTableRegex, tableToObj } from "../lib/utilities";
import Component from "@ember/component";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "I18n";

export default Component.extend({
  tagName: "",
  showEditReason: false,

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
  },

  @action
  showEditReasonField() {
    if (this.showEditReason) {
      return this.set("showEditReason", false);
    } else {
      return this.set("showEditReason", true);
    }
  },

  @action
  cancelTableEdit() {
    this.triggerModalClose();
  },

  @action
  editTable() {
    const updatedHeaders = this.spreadsheet.getHeaders().split(","); // keys
    const updatedData = this.spreadsheet.getData(); // values

    const markdownTable = this.buildTableMarkdown(updatedHeaders, updatedData);
    const tableId = this.get("tableId");
    const postId = this.model.id;
    const newRaw = markdownTable;
    const editReason =
      this.get("editReason") ||
      I18n.t(themePrefix("discourse_table_builder.edit.default_edit_reason"));
    const raw = this.model.raw;
    const newPostRaw = this.buildUpdatedPost(tableId, raw, newRaw);

    this.updateTable(postId, newPostRaw, editReason);
  },

  buildUpdatedPost(tableId, raw, newRaw) {
    const tableToEdit = raw.match(findTableRegex());
    let editedTable;

    if (tableToEdit.length > 1) {
      editedTable = raw.replace(tableToEdit[tableId], newRaw);
    } else {
      editedTable = raw.replace(findTableRegex(), newRaw);
    }

    return editedTable;
  },

  updateTable(postId, raw, edit_reason) {
    return ajax(`/posts/${postId}.json`, {
      type: "PUT",
      data: {
        post: {
          raw,
          edit_reason,
        },
      },
    })
      .catch(popupAjaxError)
      .finally(() => {
        this.triggerModalClose();
      });
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
