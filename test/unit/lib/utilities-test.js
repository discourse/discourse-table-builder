import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import mdTableFixture from "../../fixtures/md-table-fixture";
import mdTableSpecialCharsFixture from "../../fixtures/md-table-special-chars-fixture";
import { arrayToTable } from "../../../discourse-table-builder/lib/utilities";

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
});
