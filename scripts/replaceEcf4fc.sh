#!/bin/bash
# Script to replace #ecf4fc with THEME_COLORS.surfaceLight in all JS files

echo "Replacing #ecf4fc with THEME_COLORS.surfaceLight..."

# Files to update (main JS files with many #ecf4fc occurrences)
files=(
  "src/components/MainComponents/DashboardContent.js"
  "src/pages/Dashboard.js"
  "src/components/Modals/NewVLObject.js"
  "src/components/Modals/NewObjectDialog/ValueListObjectDialog.js"
  "src/components/Modals/NewObjectDialog/PropertiesList.js"
  "src/components/Modals/NewObjectDialog/ObjectFormDialog.js"
  "src/components/Modals/NewObjectDialog/ClassSelectionDialog.js"
  "src/components/FileUpload.js"
  "src/components/AutomaticPermissionsDialog.js"
  "src/components/AutomaticPermissionsButton.js"
  "src/components/Bot/Bot.js"
)

for file in "${files[@]}"
do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    sed -i "s/'#ecf4fc'/THEME_COLORS.surfaceLight/g" "$file"
  fi
done

echo "Done! All #ecf4fc have been replaced with THEME_COLORS.surfaceLight"
echo "Now make sure all these files import THEME_COLORS from '../constants/themeColors'"
