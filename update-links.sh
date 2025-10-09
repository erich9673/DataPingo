#!/bin/bash

# Script to remove .html extensions from all internal links
# This updates all navigation and footer links across the website

echo "Updating internal links to remove .html extensions..."

# List of files to update
files=(
  "index.html"
  "company/about-us.html" 
  "company/careers.html"
  "company/contact.html"
  "products/bulk-report-generator/index.html"
  "resources/blog.html"
  "resources/documentation.html" 
  "resources/resources.html"
  "docs/bulk-report-generator/index.html"
  "partners/become-a-partner.html"
  "partners/find-a-partner.html"
)

# Update links in each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Replace company links
    sed -i '' 's|/company/about-us\.html|/company/about-us|g' "$file"
    sed -i '' 's|/company/careers\.html|/company/careers|g' "$file"
    sed -i '' 's|/company/contact\.html|/company/contact|g' "$file"
    
    # Replace resource links
    sed -i '' 's|/resources/blog\.html|/resources/blog|g' "$file"
    sed -i '' 's|/resources/use-cases\.html|/resources/use-cases|g' "$file"
    sed -i '' 's|/resources/documentation\.html|/resources/documentation|g' "$file"
    
    # Replace partner links
    sed -i '' 's|/partners/become-a-partner\.html|/partners/become-a-partner|g' "$file"
    sed -i '' 's|/partners/find-a-partner\.html|/partners/find-a-partner|g' "$file"
    
    # Replace legal links
    sed -i '' 's|/privacy\.html|/privacy|g' "$file"
    sed -i '' 's|/terms\.html|/terms|g' "$file"
    
    echo "✅ Updated $file"
  else
    echo "❌ File not found: $file"
  fi
done

echo "All internal links updated to clean URLs!"