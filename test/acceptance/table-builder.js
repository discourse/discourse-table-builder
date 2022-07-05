import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";

acceptance("Table Builder", function (needs) {
  needs.user();

  test("Can open table builder when creating a topic", async function (assert) {
    await visit("/");
    await click("#create-topic");
    click(".table-builder");
    assert.ok(exists(".table-builder-modal"));
  });

  test("Can build table", async function (assert) {
    await visit("/");
    await click("#create-topic");
    click(".btn-build-table");
    assert.ok(exists(".d-editor-preview .md-table"));
  });

  test("Can build table when editing post", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click("#post_1 .show-more-actions");
    await click("#post_1 .edit");
    assert.ok(exists("#reply-control"));
    click(".table-builder");
    assert.ok(exists(".table-builder-modal"));
    click(".btn-build-table");
    assert.ok(exists(".d-editor-preview .md-table"));
  });
});
