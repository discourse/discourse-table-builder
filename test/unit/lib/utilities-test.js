import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import markdownTableFixture from "../../fixtures/markdown-table-fixture";
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
      markdownTableFixture,
      "it creates a markdown table from an array of objects (with headers as keys)"
    );
  });
});
