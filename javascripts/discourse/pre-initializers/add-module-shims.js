// Backwards compatility for core versions before 82b16f4f
// Can be removed once 3.2.0.beta1 is released, and the compat file is updated

const themeId = themePrefix("foo").match(/theme_translations\.(\d+)\.foo/)[1];
const base = `discourse/theme-${themeId}`;

if (!require.entries[`${base}/discourse/components/spreadsheet-editor`]) {
  console.warn(
    "Running on an old version of core. discourse-table-builder is shimming modules to keep old imports working."
  );

  define(
    `discourse/discourse-table-builder/lib/utilities`,
    ["exports", `${base}/discourse-table-builder/lib/utilities`],
    function (_exports, utilities) {
      _exports.tokenRange = utilities.tokenRange;
      _exports.arrayToTable = utilities.arrayToTable;
      _exports.findTableRegex = utilities.findTableRegex;
    }
  );

  define(
    `discourse/discourse-table-builder/lib/locale-mapping`,
    ["exports", `${base}/discourse-table-builder/lib/locale-mapping`],
    function (_exports, localeMapping) {
      _exports.localeMapping = localeMapping.localeMapping;
    }
  );
}

export default {
  name: "add-template-module-shims",
  initialize() {},
};
