import { action } from "@ember/object";
import loadScript from "discourse/lib/load-script";
import {
  arrayToTable,
  findTableRegex,
  tokenRange,
} from "../../discourse-table-builder/lib/utilities";

import Component from "@glimmer/component";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "I18n";
import { schedule } from "@ember/runloop";
import { tracked } from "@glimmer/tracking";
import { inject as service } from "@ember/service";
export default class SpreadsheetEditor extends Component {
  @service dialog;
  @tracked showEditReason = false;
  @tracked loading = null;

  spreadsheet = null;
  defaultColWidth = 150;
  isEditingTable = !!this.args.model.tableTokens;

  // Getters:
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
          this.buildPopulatedTable(this.args.model.tableTokens);
        } else {
          this.buildNewTable();
        }
      });
    });
  }

  @action
  showEditReasonField() {
    this.showEditReason = !this.showEditReason;
  }

  @action
  interceptCloseModal() {
    if (this._hasChanges()) {
      this.dialog.yesNoConfirm({
        message: I18n.t(
          themePrefix("discourse_table_builder.modal.confirm_close")
        ),
        didConfirm: () => {
          this.args.closeModal();
        },
      });
    } else {
      this.args.closeModal();
    }
  }

  @action
  insertTable() {
    const updatedHeaders = this.spreadsheet.getHeaders().split(","); // keys
    const updatedData = this.spreadsheet.getData(); // values
    const markdownTable = this.buildTableMarkdown(updatedHeaders, updatedData);

    if (!this.isEditingTable) {
      this.args.model.toolbarEvent.addText(markdownTable);
      return this.args.closeModal();
    } else {
      return this.updateTable(markdownTable);
    }
  }

  _hasChanges() {
    if (this.isEditingTable) {
      const originalSpreadsheetData = this.extractTableContent(
        tokenRange(this.args.model.tableTokens, "tr_open", "tr_close")
      );
      const currentHeaders = this.spreadsheet.getHeaders().split(",");
      const currentRows = this.spreadsheet.getData();
      const currentSpreadsheetData = currentHeaders.concat(currentRows.flat());

      return (
        JSON.stringify(currentSpreadsheetData) !==
        JSON.stringify(originalSpreadsheetData)
      );
    } else {
      return this.spreadsheet
        .getData()
        .flat()
        .some((element) => element !== "");
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
      text: this.localeMapping(),
      ...opts,
    });
  }

  buildUpdatedPost(tableIndex, raw, newRaw) {
    const tableToEdit = raw.match(findTableRegex());
    let editedTable;

    if (tableToEdit.length) {
      editedTable = raw.replace(tableToEdit[tableIndex], newRaw);
    } else {
      return raw;
    }

    // replace null characters
    editedTable = editedTable.replace(/\0/g, "\ufffd");
    return editedTable;
  }

  updateTable(markdownTable) {
    const tableIndex = this.args.model.tableIndex;
    const postId = this.args.model.post.id;
    const newRaw = markdownTable;

    const editReason =
      this.editReason ||
      I18n.t(themePrefix("discourse_table_builder.edit.default_edit_reason"));
    const raw = this.args.model.post.raw;
    const newPostRaw = this.buildUpdatedPost(tableIndex, raw, newRaw);

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
        this.args.closeModal();
      });
  }

  buildTableMarkdown(headers, data) {
    const table = [];
    data.forEach((row) => {
      const result = {};

      headers.forEach((_key, index) => {
        const columnKey = `col${index}`;
        return (result[columnKey] = row[index]);
      });
      table.push(result);
    });

    return arrayToTable(table, headers);
  }

  localeMapping() {
    return {
      noRecordsFound: prefixedLocale("no_records_found"),
      show: prefixedLocale("show"),
      entries: prefixedLocale("entries"),
      insertANewColumnBefore: prefixedLocale("context_menu.col.before"),
      insertANewColumnAfter: prefixedLocale("context_menu.col.after"),
      deleteSelectedColumns: prefixedLocale("context_menu.col.delete"),
      renameThisColumn: prefixedLocale("context_menu.col.rename"),
      orderAscending: prefixedLocale("context_menu.order.ascending"),
      orderDescending: prefixedLocale("context_menu.order.descending"),
      insertANewRowBefore: prefixedLocale("context_menu.row.before"),
      insertANewRowAfter: prefixedLocale("context_menu.row.after"),
      deleteSelectedRows: prefixedLocale("context_menu.row.delete"),
      copy: prefixedLocale("context_menu.copy"),
      paste: prefixedLocale("context_menu.paste"),
      saveAs: prefixedLocale("context_menu.save"),
      about: prefixedLocale("about"),
      areYouSureToDeleteTheSelectedRows: prefixedLocale(
        "prompts.delete_selected_rows"
      ),
      areYouSureToDeleteTheSelectedColumns: prefixedLocale(
        "prompts.delete_selected_cols"
      ),
      thisActionWillDestroyAnyExistingMergedCellsAreYouSure: prefixedLocale(
        "prompts.will_destroy_merged_cells"
      ),
      thisActionWillClearYourSearchResultsAreYouSure: prefixedLocale(
        "prompts.will_clear_search_results"
      ),
      thereIsAConflictWithAnotherMergedCell: prefixedLocale(
        "prompts.conflict_with_merged_cells"
      ),
      invalidMergeProperties: prefixedLocale("invalid_merge_props"),
      cellAlreadyMerged: prefixedLocale("cells_already_merged"),
      noCellsSelected: prefixedLocale("no_cells_selected"),
    };
  }
}

function prefixedLocale(localeString) {
  return I18n.t(
    themePrefix(`discourse_table_builder.spreadsheet.${localeString}`)
  );
}
