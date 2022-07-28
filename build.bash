#!/bin/bash

# Global Variables:
SCSS_VENDOR=scss/vendor/
JS_VENDOR=assets/vendor/

JSUITES_JS_URL="https://jsuites.net/v4/jsuites.js"
JSPREADSHEET_JS_URL="https://bossanova.uk/jspreadsheet/v4/jexcel.js"

JSUITES_CSS_URL="https://raw.githubusercontent.com/jsuites/jsuites/master/dist/jsuites.basic.css"
JSPREADSHEET_CSS_URL="https://bossanova.uk/jspreadsheet/v4/jexcel.css"

JSUITES_CSS_FILE=jsuites.basic.css
JSUITES_SCSS_FILE=jsuites.scss
JSUITES_SCSS_FILE_LOCATION=$SCSS_VENDOR$JSUITES_SCSS_FILE

JSUITES_JS_FILE=jsuites.js
JSUITES_NEW_JS_FILE=jsuites.js
JSUITES_JS_FILE_LOCATION=$JS_VENDOR$JSUITES_NEW_JS_FILE

JSPREADSHEET_CSS_FILE=jexcel.css
JSPREADSHEET_SCSS_FILE=jspreadsheet.scss
JSPREADSHEET_SCSS_FILE_LOCATION=$SCSS_VENDOR$JSPREADSHEET_SCSS_FILE

JSPREADSHEET_JS_FILE=jexcel.js
JSPREADSHEET_NEW_JS_FILE=jspreadsheet.js
JSPREADSHEET_JS_FILE_LOCATION=$JS_VENDOR$JSPREADSHEET_NEW_JS_FILE




# Remove all vendor related files:
rm -r ${SCSS_VENDOR}*
rm -r ${JS_VENDOR}

# Recreate vendor directory
mkdir $JS_VENDOR
echo "Old vendor assets have been removed."


# STYLESHEETS:
# Add JSuite vendor file
if test -f "$JSUITES_CSS_FILE"; then
  echo "$JSUITES_CSS_FILE already exists."
else
  # Fetch jsuite stylesheet
  wget $JSUITES_CSS_URL
  echo "$JSUITES_CSS_FILE has been created in $(pwd)"
  # Move jsuite stylesheet to vendor as a scss file
  mv $JSUITES_CSS_FILE $JSUITES_SCSS_FILE_LOCATION
  echo "$JSUITES_SCSS_FILE has been placed in the scss vendor directory"
  # Scope styles to jexcel_container class
  sed -i '' '1s/^/.jexcel_container {\n/' $JSUITES_SCSS_FILE_LOCATION
  sed -i '' '$a\
  }' $JSUITES_SCSS_FILE_LOCATION

  # Remove conflicting animation classes
  # TODO: Improve below code to handle nested code blocks
fi

# Add JSpreadsheet vendor file
if test -f "$JSPREADSHEET_CSS_FILE"; then
  echo "$JSPREADSHEET_CSS_FILE already exists."
else
  # Fetch jspreadsheet stylesheet
  wget $JSPREADSHEET_CSS_URL
  echo "$JSPREADSHEET_CSS_FILE has been created in $(pwd)"
  # Move jspreadsheet stylesheet to vendor as a scss file
  mv $JSPREADSHEET_CSS_FILE $JSPREADSHEET_SCSS_FILE_LOCATION
fi

# Apply prettier to vendor files
yarn prettier --write $SCSS_VENDOR

# JAVASCRIPTS:
if test -f "$JSUITES_JS_FILE"; then
  echo "$JSUITES_JS_FILE already exists."
else
  wget $JSUITES_JS_URL
  mv $JSUITES_JS_FILE $JSUITES_JS_FILE_LOCATION
fi

if test -f "$JSPREADSHEET_JS_FILE"; then
  echo "$JSPREADSHEET_JS_FILE already exists."
else
  wget $JSPREADSHEET_JS_URL
  mv $JSPREADSHEET_JS_FILE $JSPREADSHEET_JS_FILE_LOCATION
fi
