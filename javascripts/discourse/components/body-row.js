import GlimmerComponent from "discourse/components/glimmer";
import { action } from "@ember/object";

export default class BodyRow extends GlimmerComponent {
  get disableRemoveRow() {
    if (this.args.allRows.length > 1) {
      return false;
    } else {
      return true;
    }
  }

  @action
  addBodyValue() {
    const columnId = this.args.columnId;
    const rowId = this.args.row.id;
    const value = this.bodyRowValue;

    this.args.setRowValue(columnId, rowId, value);
  }

  @action
  addRow() {
    const columnId = this.args.columnId;
    const rowId = this.args.allRows.length + 1;

    this.args.addRow(columnId, rowId);
  }

  @action
  removeRow() {
    this.args.removeRow(this.args.columnId, this.args.row);
  }
}
