#!/bin/bash

# Mobile Menu Structure for DataPingo
MENU_HTML='    <div class="mobile-menu" id="mobileMenu">
      <!-- Home -->
      <a href="/mobile/" class="mobile-menu-item">🏠 Home</a>
      
      <!-- Products Section -->
      <div class="mobile-menu-section">
        <button class="mobile-menu-header" onclick="toggleMobileSection('"'"'products'"'"')">
          📦 Products <span class="mobile-arrow" id="products-arrow">▼</span>
        </button>
        <div class="mobile-submenu" id="products-submenu">
          <a href="/mobile/products/bulk-report-generator/" class="mobile-submenu-item">Bulk Report Generator for Confluence</a>
        </div>
      </div>
      
      <!-- Company Section -->
      <div class="mobile-menu-section">
        <button class="mobile-menu-header" onclick="toggleMobileSection('"'"'company'"'"')">
          🏢 Company <span class="mobile-arrow" id="company-arrow">▼</span>
        </button>
        <div class="mobile-submenu" id="company-submenu">
          <a href="/mobile/company/about-us" class="mobile-submenu-item">About Us</a>
          <a href="/mobile/company/careers" class="mobile-submenu-item">Careers</a>
          <a href="/mobile/company/contact" class="mobile-submenu-item">Contact</a>
        </div>
      </div>
      
      <!-- Partners Section -->
      <div class="mobile-menu-section">
        <button class="mobile-menu-header" onclick="toggleMobileSection('"'"'partners'"'"')">
          🤝 Partners <span class="mobile-arrow" id="partners-arrow">▼</span>
        </button>
        <div class="mobile-submenu" id="partners-submenu">
          <a href="/mobile/partners/become-a-partner" class="mobile-submenu-item">Become a Partner</a>
          <a href="/mobile/partners/find-a-partner" class="mobile-submenu-item">Find a Partner</a>
        </div>
      </div>
      
      <!-- Resources Section -->
      <div class="mobile-menu-section">
        <button class="mobile-menu-header" onclick="toggleMobileSection('"'"'resources'"'"')">
          📚 Resources <span class="mobile-arrow" id="resources-arrow">▼</span>
        </button>
        <div class="mobile-submenu" id="resources-submenu">
          <a href="/mobile/resources/blog" class="mobile-submenu-item">Blog</a>
          <a href="/mobile/resources/use-cases" class="mobile-submenu-item">Use Cases</a>
          <a href="/mobile/resources/documentation" class="mobile-submenu-item">Documentation</a>
        </div>
      </div>
    </div>'

SCRIPT_JS='    // Toggle mobile submenu sections
    function toggleMobileSection(sectionId) {
      const submenu = document.getElementById(sectionId + '"'"'-submenu'"'"');
      const arrow = document.getElementById(sectionId + '"'"'-arrow'"'"');
      
      if (submenu.classList.contains('"'"'active'"'"')) {
        submenu.classList.remove('"'"'active'"'"');
        arrow.textContent = '"'"'▼'"'"';
      } else {
        // Close all other submenus first
        document.querySelectorAll('"'"'.mobile-submenu'"'"').forEach(menu => {
          menu.classList.remove('"'"'active'"'"');
        });
        document.querySelectorAll('"'"'.mobile-arrow'"'"').forEach(arr => {
          arr.textContent = '"'"'▼'"'"';
        });
        
        // Open clicked submenu
        submenu.classList.add('"'"'active'"'"');
        arrow.textContent = '"'"'▲'"'"';
      }
    }'

echo "Mobile navigation update script created"
echo "This would update all mobile pages with the new navigation structure"