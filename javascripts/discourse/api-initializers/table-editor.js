import { apiInitializer } from "discourse/lib/api";
import showModal from "discourse/lib/show-modal";
import { schedule } from "@ember/runloop";
import I18n from "I18n";
import { iconNode } from "discourse-common/lib/icon-library";
import { create } from "virtual-dom";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default apiInitializer("0.11.1", (api) => {
  const site = api.container.lookup("site:main");
  const currentUser = api.getCurrentUser();

  function createButton() {
    const openPopupBtn = document.createElement("button");
    openPopupBtn.classList.add(
      "open-popup-link",
      "btn-default",
      "btn",
      "btn-icon-text"
    );
    const expandIcon = create(
      iconNode("pencil-alt", { class: "edit-table-icon" })
    );
    const openPopupText = document.createTextNode(
      I18n.t(themePrefix("discourse_table_builder.edit.btn_edit"))
    );
    openPopupBtn.append(expandIcon, openPopupText);
    return openPopupBtn;
  }

  function generateModal(event) {
    const table = event.target.parentNode.lastElementChild;
    const tempTable = table.cloneNode(true);
    const postId = this.id;

    return ajax(`/posts/${postId}`, {
      type: "GET",
      cache: false,
    })
      .then((result) => {
        const attrs = {
          widget: this,
          raw: result.raw,
        };

        showModal("table-editor-modal", {
          model: attrs,
        }).setProperties({
          tableHtml: tempTable,
          submitOnEnter: false,
        });
        return result.raw;
      })
      .catch(popupAjaxError);
  }

  function generatePopups(tables, attrs) {
    tables.forEach((table) => {
      if (site.isMobileDevice) {
        return;
      }

      const popupBtn = createButton();
      table.parentNode.classList.add("fullscreen-table-wrapper");
      const expandBtn = document.querySelector(".open-popup-link");

      if (table.parentNode.contains(expandBtn)) {
        expandBtn.parentNode.insertBefore(popupBtn, expandBtn);
      } else {
        table.parentNode.insertBefore(popupBtn, table);
      }
      popupBtn.addEventListener("click", generateModal.bind(attrs), false);
    });
  }

  api.decorateCookedElement(
    (post, helper) => {
      const postOwner = helper.widget.attrs.username;

      if (postOwner !== currentUser.username) {
        return;
      }

      schedule("afterRender", () => {
        const tables = post.querySelectorAll("table");
        generatePopups(tables, helper.widget.attrs);
      });
    },
    {
      onlyStream: true,
      id: "edit-table",
    }
  );
});
