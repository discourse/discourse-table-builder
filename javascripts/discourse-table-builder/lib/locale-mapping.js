import I18n from "I18n";

function prefixedLocale(localeString) {
  return I18n.t(
    themePrefix(`discourse_table_builder.spreadsheet.${localeString}`)
  );
}

export const localeMapping = {
  noRecordsFound: prefixedLocale("no_records_found"),
  showingPage: prefixedLocale("showing_page"),
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
