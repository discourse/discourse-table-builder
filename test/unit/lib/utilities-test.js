import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import mdTableFixture from "../../fixtures/md-table-fixture";
import mdTableSpecialCharsFixture from "../../fixtures/md-table-special-chars-fixture";
import {
  arrayToTable,
  findTableRegex,
} from "../../../discourse-table-builder/lib/utilities";

discourseModule("Unit | Utilities", function () {
  test("arrayToTable", function (assert) {
    const tableData = [
      {
        Make: "Toyota",
        Model: "Supra",
        Year: "1998",
      },
      {
        Make: "Nissan",
        Model: "Skyline",
        Year: "1999",
      },
      {
        Make: "Honda",
        Model: "S2000",
        Year: "2001",
      },
    ];

    assert.strictEqual(
      arrayToTable(tableData),
      mdTableFixture,
      "it creates a markdown table from an array of objects (with headers as keys)"
    );

    const specialCharsTableData = [
      {
        Make: "Toyota",
        Model: "Supra",
        Price: "$50,000",
      },
      {
        Make: "",
        Model: "Celica",
        Price: "$20,000",
      },
      {
        Make: "Nissan",
        Model: "GTR",
        Price: "$80,000",
      },
    ];

    assert.strictEqual(
      arrayToTable(specialCharsTableData),
      mdTableSpecialCharsFixture,
      "it creates a markdown table with special characters in correct alignment"
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
