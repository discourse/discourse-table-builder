# frozen_string_literal: true

module PageObjects
  module Modals
    class InsertTable < PageObjects::Modals::Base
      MODAL_SELECTOR = ".insert-table-modal"
      SPREADSHEET_TABLE_SELECTOR = "#{MODAL_SELECTOR} .jexcel"

      def click_insert_table
        find("#{MODAL_SELECTOR} .btn-insert-table").click
      end

      def cancel
        find("#{MODAL_SELECTOR} .d-modal-cancel").click
      end

      def select_cell(row, col)
        find(
          "#{SPREADSHEET_TABLE_SELECTOR} tbody tr[data-y='#{row}'] td[data-x='#{col}']"
        ).click
      end
    end
  end
end
