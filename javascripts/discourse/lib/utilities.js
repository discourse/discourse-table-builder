/* eslint-disable */

/**
 * Generate an object from an HTML table
 *
 * @see {@link https://gist.github.com/mattheo-gist/4151867|GitHub}
 *
 * @param  {Table} table HTML Table element
 *
 * @return {Object} A JavaScript object
 */
export function tableToObj(table) {
  var rows = table.rows;
  var propCells = rows[0].cells;
  var propNames = [];
  var results = [];
  var obj, row, cells;

  // Use the first row for the property names
  // Could use a header section but result is the same if
  // there is only one header row
  for (var i = 0, iLen = propCells.length; i < iLen; i++) {
    propNames.push(propCells[i].textContent || propCells[i].innerText);
  }

  // Use the rows for data
  // Could use tbody rows here to exclude header & footer
  // but starting from 1 gives required result
  for (var j = 1, jLen = rows.length; j < jLen; j++) {
    cells = rows[j].cells;
    obj = {};

    for (var k = 0; k < iLen; k++) {
      obj[propNames[k]] = cells[k].textContent || cells[k].innerText;
    }
    results.push(obj);
  }
  return results;
}

/**
 * Generate markdown table from an array of objects
 *
 * @see {@link https://github.com/Nijikokun/array-to-table|GitHub}:
 *
 * @param  {Array} array    Array of objects
 * @param  {Array} columns  Optional, table column names, otherwise taken from the keys of the first object
 * @param  {String} alignment Optional table alignment. Can be 'center' (default), 'left' or 'right'
 *
 * @return {String} Markdown table
 */
export function arrayToTable(array, columns, alignment = "center") {
  var table = "";
  var separator = {
    left: ":---",
    right: "---:",
    center: "---",
  };

  // Generate column list
  var cols = columns ? columns.split(",") : Object.keys(array[0]);

  // Generate table headers
  table += cols.join(" | ");
  table += "\r\n";

  // Generate table header seperator
  table += cols
    .map(function () {
      return separator[alignment] || separator.center;
    })
    .join(" | ");
  table += "\r\n";

  // Generate table body
  array.forEach(function (item) {
    table +=
      cols
        .map(function (key) {
          return String(item[key] || "");
        })
        .join(" | ") + "\r\n";
  });

  // Return table
  return table;
}

/**
 *
 * @returns a regular experssion finding all markdown tables
 */
export function findTableRegex() {
  return /((\r?){2}|^)([^\r\n]*\|[^\r\n]*(\r?\n)?)+(?=(\r?\n){2}|$)/gm;
}
