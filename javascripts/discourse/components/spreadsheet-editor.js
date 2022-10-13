import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import {
  arrayToTable,
  findTableRegex,
  tokenRange,
} from "../discourse-table-builder/lib/utilities";
import Component from "@glimmer/component";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "I18n";
import { schedule } from "@ember/runloop";
import { tracked } from "@glimmer/tracking";

export default class SpreadsheetEditor extends Component {
  @tracked showEditReason = false;
  spreadsheet = null;
  defaultColWidth = 150;
  @tracked loading = null;

  // Getters:
  get isEditingTable() {
    if (this.args.tableTokens) {
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
          this.buildPopulatedTable(this.args.tableTokens);
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
    this.loading = true;
    return loadScript(settings.theme_uploads_local.jsuites)
      .then(() => {
        return loadScript(settings.theme_uploads_local.jspreadsheet);
      })
      .finally(() => (this.loading = false));
  }

  buildNewTable() {
    const data = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];

    const columns = [
      {
        title: I18n.t(
          themePrefix("discourse_table_builder.default_header.col_1")
        ),
        width: this.defaultColWidth,
      },
      {
        title: I18n.t(
          themePrefix("discourse_table_builder.default_header.col_2")
        ),
        width: this.defaultColWidth,
      },
      {
        title: I18n.t(
          themePrefix("discourse_table_builder.default_header.col_3")
        ),
        width: this.defaultColWidth,
      },
      {
        title: I18n.t(
          themePrefix("discourse_table_builder.default_header.col_4")
        ),
        width: this.defaultColWidth,
      },
    ];

    return this.buildSpreadsheet(data, columns);
  }

  extractTableContent(data) {
    return data
      .flat()
      .filter((t) => t.type === "inline")
      .map((t) => t.content);
  }

  buildPopulatedTable(tableTokens) {
    const contentRows = tokenRange(tableTokens, "tr_open", "tr_close");
    const rows = [];
    let headings;
    const rowWidthFactor = 8;

    contentRows.forEach((row, index) => {
      if (index === 0) {
        // headings
        headings = this.extractTableContent(row).map((heading) => {
          return {
            title: heading,
            width: Math.max(
              heading.length * rowWidthFactor,
              this.defaultColWidth
            ),
            align: "left",
          };
        });
      } else {
        // rows:
        rows.push(this.extractTableContent(row));
      }
    });

    return this.buildSpreadsheet(rows, headings);
  }

  buildSpreadsheet(data, columns, opts = {}) {
    const postNumber = this.args.model?.post_number;
    const exportFileName = postNumber
      ? `post-${postNumber}-table-export`
      : `post-table-export`;

    // eslint-disable-next-line no-undef
    this.spreadsheet = jspreadsheet(this.spreadsheet, {
      data,
      columns,
      defaultColAlign: "left",
      wordWrap: true,
      csvFileName: exportFileName,
      ...opts,
    });
  }

  buildUpdatedPost(tableId, raw, newRaw) {
    const tableToEdit = raw.match(findTableRegex());
    let editedTable;

    if (tableToEdit.length > 1) {
      editedTable = raw.replace(tableToEdit[tableId], newRaw);
    } else {
      editedTable = raw.replace(tableToEdit[0], newRaw);
    }

    // replace null characters
    editedTable = editedTable.replace(/\0/g, "\ufffd");
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
