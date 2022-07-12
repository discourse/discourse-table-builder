// SRC: https://gist.github.com/mattheo-gist/4151867
/* eslint-disable */

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
