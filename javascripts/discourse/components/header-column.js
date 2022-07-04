import GlimmerComponent from "discourse/components/glimmer";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class HeaderColumn extends GlimmerComponent {
  @tracked alignment;

  get disableRemoveColumn() {
    if (this.args.tableItems.length > 1) {
      return false;
    } else {
      return true;
    }
  }

  @action
  addColumn() {
    const newColumnId = this.args.tableItems.length + 1;
    this.args.addColumn(newColumnId);
  }

  @action
  removeColumn() {
    this.args.removeColumn(this.args.column);
  }

  @action
  addColumnHeader() {
    const index = this.args.columnId - 1;
    this.args.setColumnHeader(index, this.columnHeaderValue);
  }

  @action
  addRow(columnId, rowId) {
    this.args.addRow(columnId, rowId);
  }

  @action
  removeRow(columnId, row) {
    this.args.removeRow(columnId, row);
  }

  @action
  setRowValue(columnId, rowId, value) {
    this.args.setRowValue(columnId, rowId, value);
  }

  @action
  alignColumn(alignment) {
    this.args.alignColumn(this.args.columnId, alignment);
    this.alignment = alignment;
  }
}
