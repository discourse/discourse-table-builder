# frozen_string_literal: true

require_relative "page_objects/modals/insert_table"

RSpec.describe "Table Builder", system: true do
  fab!(:user) { Fabricate(:user) }

  let!(:theme_component) { upload_theme_component }
  let(:composer) { PageObjects::Components::Composer.new }
  let(:insert_table_modal) { PageObjects::Modals::InsertTable.new }

  before { sign_in(user) }

  context "when creating a new table" do
    it "should create a new table in markdown format" do
      visit("/latest")
      page.find("#create-topic").click
      page.find(".toolbar-popup-menu-options").click
      page.find(".select-kit-row[data-name='Insert Table']").click
      insert_table_modal.select_cell(2, 2)
      pause_test
    end
  end
end
