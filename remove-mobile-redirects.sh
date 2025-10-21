#!/bin/bash

# Script to remove all mobile redirects from all files

echo "Removing mobile redirects from all files..."

# Files that have mobile redirects
files=(
    "company/contact.html"
    "resources/blog.html"
    "company/about-us.html"
    "company/careers.html"
    "partners/become-a-partner.html"
    "partners/find-a-partner.html"
    "resources/documentation.html"
    "resources/documentation/bulk-report-generator/index.html"
)

for file in "${files[@]}"; do
    echo "Processing $file..."
    
    # Remove mobile redirect blocks using sed
    sed -i '' '/window\.location\.replace.*mobile/d' "$file"
    sed -i '' '/const mobileUrl = /d' "$file"
    sed -i '' '/mobileUrl = .*mobile/d' "$file"
    
done

echo "All mobile redirects removed!"