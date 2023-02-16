/* eslint-disable */

/**
 * Generate markdown table from an array of objects
 * Inspired by https://github.com/Ygilany/array-to-table
 *
 * @param  {Array} array       Array of objects
 * @param  {Array} columns     Column headings
 * @param  {String} colPrefix  Table column prefix
 *
 * @return {String} Markdown table
 */
export function arrayToTable(array, cols, colPrefix = "col") {
  var table = "";

  // Generate table headers
  table += "|";
  table += cols.join(" | ");
  table += "|\r\n|";

  // Generate table header separator
  table += cols
    .map(function () {
      return "---";
    })
    .join(" | ");
  table += "|\r\n";

  // Generate table body
  array.forEach(function (item) {
    table += "|";

    table +=
      cols
        .map(function (_key, index) {
          return String(item[`${colPrefix}${index}`] || "");
        })
        .join(" | ") + "|\r\n";
  });

  // Return table
  console.log(table);
  return table;
}

/**
 *
 * @returns a regular expression finding all markdown tables
 */
export function findTableRegex() {
  return /((\r?){2}|^)(^\|[^\r\n]*(\r?\n)?)+(?=(\r?\n){2}|$)/gm;
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
