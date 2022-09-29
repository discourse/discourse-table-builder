import {
  acceptance,
  exists,
  visible,
} from "discourse/tests/helpers/qunit-helpers";
import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import { cloneJSON } from "discourse-common/lib/object";
import topicWithTable from "../fixtures/topic-with-table";

acceptance("Table Builder - Create Table", function (needs) {
  needs.user();
  needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

  test("Can see table builder button when creating a topic", async function (assert) {
    await visit("/");
    await click("#create-topic");
    await click(".d-editor-button-bar .options");
    await selectKit(".toolbar-popup-menu-options").expand();
    assert.ok(
      exists(".select-kit-row[data-value='showTableBuilder']"),
      "it shows the builder button"
    );
  });

  test("Can see table builder button when editing post", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click("#post_1 .show-more-actions");
    await click("#post_1 .edit");
    assert.ok(exists("#reply-control"));
    await click(".d-editor-button-bar .options");
    await selectKit(".toolbar-popup-menu-options").expand();
    assert.ok(
      exists(".select-kit-row[data-value='showTableBuilder']"),
      "it shows the builder button"
    );
  });

  test("Can see table builder button when replying to a topic", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click("button.reply-to-post");
    assert.ok(exists("#reply-control"));
    await click(".d-editor-button-bar .options");
    await selectKit(".toolbar-popup-menu-options").expand();
    assert.ok(
      exists(".select-kit-row[data-value='showTableBuilder']"),
      "it shows the builder button"
    );
  });
});

acceptance("Table Builder - Edit Table", function (needs) {
  needs.pretender((server, helper) => {
    server.get("/t/960.json", () => {
      const topicList = cloneJSON(topicWithTable);
      topicList.post_stream.posts[2].post_type = 4;
      return helper.response(topicList);
    });
  });

  test("Can see edit button on post with table", async function (assert) {
    await visit("/t/960");
    await focus(document.querySelector(".cooked .md-table"));
    assert.ok(exists("button.btn-edit-md-table"), "Edit Table button exists");
    assert.ok(
      visible("button.btn-edit-md-table"),
      "Edit Table button is visible"
    );
    await click("button.btn-edit-md-table");
    assert.ok(
      exists(".insert-table-modal-modal"),
      "Table Builder modal exists"
    );
    await this.pauseTest();
  });
});
