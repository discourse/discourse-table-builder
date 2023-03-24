import { apiInitializer } from "discourse/lib/api";
import showModal from "discourse/lib/show-modal";
import { schedule } from "@ember/runloop";
import I18n from "I18n";
import { iconNode } from "discourse-common/lib/icon-library";
import { create } from "virtual-dom";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { parseAsync } from "discourse/lib/text";
import { tokenRange } from "../discourse-table-builder/lib/utilities";

export default apiInitializer("0.11.1", (api) => {
  function createButton() {
    const openPopupBtn = document.createElement("button");
    openPopupBtn.classList.add(
      "open-popup-link",
      "btn-default",
      "btn",
      "btn-icon",
      "btn-edit-table",
      "no-text"
    );
    const editIcon = create(
      iconNode("pencil-alt", { class: "edit-table-icon" })
    );
    openPopupBtn.title = I18n.t(
      themePrefix("discourse_table_builder.edit.btn_edit")
    );
    openPopupBtn.append(editIcon);
    return openPopupBtn;
  }

  function generateModal(event) {
    const tableId = event.target.getAttribute("data-table-id");

    return ajax(`/posts/${this.id}`, { type: "GET" })
      .then((post) =>
        parseAsync(post.raw).then((tokens) => {
          const allTables = tokenRange(tokens, "table_open", "table_close");
          const tableTokens = allTables[tableId];

          showModal("insert-table-modal", {
            model: post,
          }).setProperties({
            tableId,
            tableTokens,
          });
        })
      )
      .catch(popupAjaxError);
  }

  function generatePopups(tables, attrs) {
    tables.forEach((table, index) => {
      const popupBtn = createButton();
      popupBtn.setAttribute("data-table-id", index); // sets a table id so each table can be distinctly edited
      table.parentNode.classList.add("fullscreen-table-wrapper");
      const expandBtn = table.parentNode.querySelector(".open-popup-link");

      if (table.parentNode.contains(expandBtn)) {
        expandBtn.parentNode.insertBefore(popupBtn, expandBtn);
      } else {
        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("fullscreen-table-wrapper--buttons");
        buttonWrapper.append(popupBtn);
        table.parentNode.insertBefore(buttonWrapper, table);
      }

      popupBtn.addEventListener("click", generateModal.bind(attrs), false);
    });
  }

  function cleanupPopupBtns() {
    const popupBtns = document.querySelectorAll("button.open-popup-link");
    popupBtns.forEach((btn) => btn.removeEventListener("click", generateModal));
  }

  api.decorateCookedElement(
    (post, helper) => {
      const canEdit = helper.widget.attrs.canEdit;

      if (!canEdit) {
        return;
      }

      schedule("afterRender", () => {
        const tables = post.querySelectorAll(".md-table table");
        generatePopups(tables, helper.widget.attrs);
      });
    },
    {
      onlyStream: true,
      id: "edit-table",
    }
  );

  api.cleanupStream(cleanupPopupBtns);
});
