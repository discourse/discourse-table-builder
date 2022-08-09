/* eslint-disable */

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

export function tokenRange(tokens, start, end) {
  const contents = [];
  let startPushing = false;
  let items = [];

  tokens.forEach((token) => {
    if (token.type === start) {
      startPushing = true;
    }

    if (token.type === end) {
      contents.push(items);
      items = [];
      startPushing = false;
    }

    if (startPushing) {
      items.push(token);
    }
  });

  return contents;
}
