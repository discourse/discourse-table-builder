/* eslint-disable */
// ! TODO: Issues with test unable to import from lib/utilities.js
export default function arrayToTable(array, columns) {
  var table = "";

  // Generate column list
  var cols = columns ? columns.split(",") : Object.keys(array[0]);

  // Generate table headers
  table += "|";
  table += cols.join(" | ");
  table += "|\r\n|";

  // Generate table header seperator
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
        .map(function (key) {
          return String(item[key] || "");
        })
        .join(" | ") + "|\r\n";
  });

  // Return table
  return table;
}
