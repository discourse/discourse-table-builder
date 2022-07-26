import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import { arrayToTable, findTableRegex, tableToObj } from "../lib/utilities";
import GlimmerComponent from "discourse/components/glimmer";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "I18n";
import { schedule } from "@ember/runloop";
import { tracked } from "@glimmer/tracking";
export default class SpreadsheetEditor extends GlimmerComponent {
  @tracked showEditReason = false;
  spreadsheet = null;

  // Getters:
  get isEditingTable() {
    if (this.args.tableHtml) {
      return true;
    }

    return false;
  }

  get modalAttributes() {
    if (this.isEditingTable) {
      return {
        title: themePrefix("discourse_table_builder.edit.modal.title"),
        insertTable: {
          title: themePrefix("discourse_table_builder.edit.modal.create"),
          icon: "pencil-alt",
        },
      };
    } else {
      return {
        title: themePrefix("discourse_table_builder.modal.title"),
        insertTable: {
          title: themePrefix("discourse_table_builder.modal.create"),
          icon: "plus",
        },
      };
    }
  }

  // Actions:
  @action
  createSpreadsheet(spreadsheet) {
    this.spreadsheet = spreadsheet;

    schedule("afterRender", () => {
      this.loadLibraries().then(() => {
        if (this.isEditingTable) {
          this.buildPopulatedTable(this.args.tableHtml);
        } else {
          this.buildNewTable();
        }
      });
    });
  }

  @action
  showEditReasonField() {
    if (this.showEditReason) {
      this.showEditReason = false;
    } else {
      this.showEditReason = true;
    }
  }

  @action
  cancelTableInsertion() {
    this.args.triggerModalClose();
  }

  @action
  insertTable() {
    const updatedHeaders = this.spreadsheet.getHeaders().split(","); // keys
    const updatedData = this.spreadsheet.getData(); // values
    const markdownTable = this.buildTableMarkdown(updatedHeaders, updatedData);

    if (!this.isEditingTable) {
      this.args.toolbarEvent.addText(markdownTable);
      return this.args.triggerModalClose();
    } else {
      return this.updateTable(markdownTable);
    }
  }

  // Helper Methods:
  loadLibraries() {
    return loadScript(settings.theme_uploads_local.jsuites).then(() => {
      return loadScript(settings.theme_uploads_local.jspreadsheet);
    });
  }

  buildNewTable() {
    const data = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];

    const columns = [
      { title: "Column 1", width: 150 },
      { title: "Column 2", width: 150 },
      { title: "Column 3", width: 150 },
    ];

    return this.buildSpreadsheet(data, columns);
  }

  buildPopulatedTable(table) {
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

    return this.buildSpreadsheet(tableData, columns);
  }

  buildSpreadsheet(data, columns, opts = {}) {
    // eslint-disable-next-line no-undef
    this.spreadsheet = jspreadsheet(this.spreadsheet, {
      data,
      columns,
      ...opts,
    });
  }

  buildUpdatedPost(tableId, raw, newRaw) {
    const tableToEdit = raw.match(findTableRegex());
    let editedTable;

    if (tableToEdit.length > 1) {
      editedTable = raw.replace(tableToEdit[tableId], newRaw);
    } else {
      editedTable = raw.replace(findTableRegex(), newRaw);
    }

    return editedTable;
  }

  updateTable(markdownTable) {
    const tableId = this.args.tableId;
    const postId = this.args.model.id;
    const newRaw = markdownTable;

    const editReason =
      this.editReason ||
      I18n.t(themePrefix("discourse_table_builder.edit.default_edit_reason"));
    const raw = this.args.model.raw;
    const newPostRaw = this.buildUpdatedPost(tableId, raw, newRaw);

    return this.sendTableUpdate(postId, newPostRaw, editReason);
  }

  sendTableUpdate(postId, raw, edit_reason) {
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
        this.args.triggerModalClose();
      });
  }

  buildTableMarkdown(headers, data) {
    const table = [];
    data.forEach((row) => {
      const result = {};

      headers.forEach((key, index) => (result[key] = row[index]));
      table.push(result);
    });

    return arrayToTable(table);
  }
}
