import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { A } from "@ember/array";

export default class extends Controller {
  @tracked tableItems = A([
    { column: 1, rows: A([{ id: 1 }]) },
    { column: 2, rows: A([{ id: 1 }]) },
  ]);

  @action
  cancelTableCreation() {
    this.send("closeModal");
  }

  createDivider(alignment) {
    switch (alignment) {
      case "left":
        return ":--";
        break;
      case "right":
        return "--:";
        break;
      case "center":
        return ":--:";
        break;
      default:
        return "--";
        break;
    }
  }

  buildTable(table) {
    const headings = [];
    const divider = [];
    const rows = [];

    table.forEach((item) => {
      headings.push(item.header);
      divider.push(this.createDivider(item.alignment));
      item.rows.forEach((r) => rows.push(r));
    });

    // Make an object for each row rather than by column
    const rowItems = rows.reduce((row, { id, content }) => {
      row[id] ??= { id, content: [] };
      if (Array.isArray(content)) {
        row[id].content = row[id].value.concat(content);
      } else {
        row[id].content.push(content);
      }
      return row;
    }, {});

    const header = `|${headings.join("|")}|\n`;
    const tableDivider = `|${divider.join("|")}|\n`;

    let rowValues;
    Object.values(rowItems).forEach((item) => {
      item.content.forEach((line) => {
        if (line === undefined) {
          line = "";
        }

        if (rowValues) {
          rowValues += `${line}|`;
        } else {
          rowValues = `|${line}|`;
        }
      });
      rowValues += "\n";
    });

    let tableMarkdown = header + tableDivider + rowValues;

    this.toolbarEvent.addText(tableMarkdown);
  }

  @action
  createTable() {
    this.buildTable(this.tableItems);
    this.send("closeModal");
  }

  @action
  removeColumn(column) {
    this.tableItems.removeObject(column);
  }

  @action
  addColumn(columnId) {
    this.tableItems.pushObject({
      column: columnId,
      rows: A([{ id: 1 }]),
    });
  }

  @action
  setColumnHeader(index, value) {
    this.tableItems[index].header = value;
  }

  @action
  addRow(columnId, rowId) {
    this.tableItems.find((item) => {
      if (item.column === columnId) {
        item.rows.pushObject({ id: rowId });
      }
    });
  }

  @action
  removeRow(columnId, row) {
    this.tableItems.find((item) => {
      if (item.column === columnId) {
        if (item.rows.length === 1) {
          // do not allow deleting if only one row left
          return;
        } else {
          item.rows.removeObject(row);
        }
      }
    });
  }

  @action
  setRowValue(columnId, rowId, value) {
    const index = columnId - 1;
    this.tableItems[index].rows.find((row) => {
      if (row.id === rowId) {
        row.content = value;
      }
    });
  }

  @action
  alignColumn(columnId, alignment) {
    this.tableItems.find((item) => {
      if (item.column === columnId) {
        item.alignment = alignment;
      }
    });
  }
}
