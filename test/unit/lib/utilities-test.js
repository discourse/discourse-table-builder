import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import {
  mdTable,
  mdTableNonUniqueHeadings,
  mdTableSpecialChars,
} from "../../fixtures/md-table";

import {
  arrayToTable,
  findTableRegex,
} from "../../../discourse-table-builder/lib/utilities";

discourseModule("Unit | Utilities", function () {
  test("arrayToTable", function (assert) {
    const tableData = [
      {
        col0: "Toyota",
        col1: "Supra",
        col2: "1998",
      },
      {
        col0: "Nissan",
        col1: "Skyline",
        col2: "1999",
      },
      {
        col0: "Honda",
        col1: "S2000",
        col2: "2001",
      },
    ];

    assert.strictEqual(
      arrayToTable(tableData, ["Make", "Model", "Year"]),
      mdTable,
      "it creates a markdown table from an array of objects (with headers as keys)"
    );

    const specialCharsTableData = [
      {
        col0: "Toyota",
        col1: "Supra",
        col2: "$50,000",
      },
      {
        col0: "",
        col1: "Celica",
        col2: "$20,000",
      },
      {
        col0: "Nissan",
        col1: "GTR",
        col2: "$80,000",
      },
    ];

    assert.strictEqual(
      arrayToTable(specialCharsTableData, ["Make", "Model", "Price"]),
      mdTableSpecialChars,
      "it creates a markdown table with special characters in correct alignment"
    );

    const nonUniqueColumns = ["col1", "col2", "col1"];

    assert.strictEqual(
      arrayToTable(
        [{ col0: "Col A", col1: "Col B", col2: "Col C" }],
        nonUniqueColumns
      ),
      mdTableNonUniqueHeadings,
      "it does not suppress a column if heading is the same as another column"
    );
  });
  test("arrayToTable with custom column prefix", function (assert) {
    const tableData = [
      {
        A0: "hey",
        A1: "you",
      },
      {
        A0: "over",
        A1: "there",
      },
    ];

    assert.strictEqual(
      arrayToTable(tableData, ["Col 1", "Col 2"], "A"),
      `|Col 1 | Col 2|\r\n|--- | ---|\r\n|hey | you|\r\n|over | there|\r\n`,
      "it works"
    );
  });

  test("findTableRegex", function (assert) {
    const oneTable = `|Make|Model|Year|\r\n|--- | --- | ---|\r\n|Toyota|Supra|1998|`;

    assert.strictEqual(
      oneTable.match(findTableRegex()).length,
      1,
      "finds one table in markdown"
    );

    const threeTables = `## Heading
|Table1 | PP Port | Device | DP | Medium|
|--- | --- | --- | --- | ---|
| Something | (1+2) | Dude | Mate | Bro |

|Table2 | PP Port | Device | DP | Medium|
|--- | --- | --- | --- | ---|
| Something | (1+2) | Dude | Mate | Bro |
| ✅  | (1+2) | Dude | Mate | Bro |
| ✅  | (1+2) | Dude | Mate | Bro |

|Table3 | PP Port | Device | DP |
|--- | --- | --- | --- |
| Something | (1+2) | Dude | Sound |
|  | (1+2) | Dude | OW |
|  | (1+2) | Dude | OI |

Random extras
    `;

    assert.strictEqual(
      threeTables.match(findTableRegex()).length,
      3,
      "finds three tables in markdown"
    );

    const ignoreUploads = `
:information_source: Something

[details=Example of a cross-connect in Equinix]
![image|603x500, 100%](upload://fURYa9mt00rXZITdYhhyeHFJE8J.png)
[/details]

|Table1 | PP Port | Device | DP | Medium|
|--- | --- | --- | --- | ---|
| Something | (1+2) | Dude | Mate | Bro |
`;
    assert.strictEqual(
      ignoreUploads.match(findTableRegex()).length,
      1,
      "finds on table, ignoring upload markup"
    );
  });
});
