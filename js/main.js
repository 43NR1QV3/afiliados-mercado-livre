/**
 * Landing Page - Produtos Mais Vendidos
 * JavaScript Principal
 */

(function () {
  "use strict";

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    dataUrl: "data/products.json",
    animationDelay: 50,
    scrollOffset: 100,
  };

  // ============================================
  // Category Icons Mapping
  // ============================================
  const CATEGORY_ICONS = {
    eletrodomésticos: "🔌",
    eletrônicos: "📱",
    celulares: "📱",
    computadores: "💻",
    informática: "🖥️",
    casa: "🏠",
    móveis: "🛋️",
    decoração: "🖼️",
    moda: "👕",
    roupas: "👗",
    calçados: "👟",
    beleza: "💄",
    saúde: "💊",
    esportes: "⚽",
    fitness: "🏋️",
    brinquedos: "🧸",
    games: "🎮",
    livros: "📚",
    ferramentas: "🔧",
    automotivo: "🚗",
    bebês: "👶",
    pet: "🐕",
    alimentos: "🍎",
    bebidas: "🥤",
    jardim: "🌱",
    papelaria: "✏️",
    instrumentos: "🎸",
    default: "📦",
  };

  // ============================================
  // State
  // ============================================
  let productsData = null;
  let activeCategory = null;

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    loading: document.getElementById("loading"),
    categoriesList: document.getElementById("categoriesList"),
    productsContainer: document.getElementById("productsContainer"),
    totalProducts: document.getElementById("totalProducts"),
    totalCategories: document.getElementById("totalCategories"),
    backToTop: document.getElementById("backToTop"),
  };

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Format price to Brazilian Real
   */
  function formatPrice(price) {
    if (!price && price !== 0) return { integer: "0", decimals: "00" };

    const parts = price.toFixed(2).split(".");
    const integer = parseInt(parts[0]).toLocaleString("pt-BR");
    const decimals = parts[1];

    return { integer, decimals };
  }

  /**
   * Get category icon
   */
  function getCategoryIcon(categoryName) {
    const name = categoryName.toLowerCase();

    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
      if (name.includes(key)) {
        return icon;
      }
    }

    return CATEGORY_ICONS.default;
  }

  /**
   * Generate slug from text
   */
  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // Data Loading
  // ============================================

  async function loadProductsData() {
    try {
      const response = await fetch(CONFIG.dataUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      productsData = await response.json();
      return productsData;
    } catch (error) {
      console.error("Error loading products:", error);
      showError("Erro ao carregar produtos. Por favor, recarregue a página.");
      return null;
    }
  }

  // ============================================
  // Rendering Functions
  // ============================================

  /**
   * Render category navigation buttons
   */
  function renderCategoriesNav(categories) {
    const html = categories
      .map((category, index) => {
        const slug = slugify(category.name);
        const icon = getCategoryIcon(category.name);

        return `
                <button
                    class="category-btn ${index === 0 ? "category-btn--active" : ""}"
                    data-category="${slug}"
                    role="tab"
                    aria-selected="${index === 0}"
                    aria-controls="section-${slug}"
                >
                    ${icon} ${category.name}
                </button>
            `;
      })
      .join("");

    elements.categoriesList.innerHTML = html;
  }

  /**
   * Render a single product card
   */
  function renderProductCard(product, categorySlug) {
    const price = formatPrice(product.price?.current);
    const originalPrice = product.price?.original;
    const discount = product.price?.discount_percent;
    const hasDiscount = discount && discount > 0;
    const hasFreeShipping = product.shipping?.free_shipping;
    const hasFulfillment = product.shipping?.fulfillment;
    const affiliateUrl = product.affiliate_url || product.url;

    return `
            <article class="product-card" itemscope itemtype="https://schema.org/Product">
                <a
                    href="${affiliateUrl}"
                    target="_blank"
                    rel="noopener sponsored"
                    class="product-card__link"
                    aria-label="Ver ${product.title}"
                >
                    <!-- Badges -->
                    <div class="product-card__badges">
                        ${
                          product.ranking
                            ? `
                            <span class="product-card__badge product-card__badge--ranking">
                                #${product.ranking}
                            </span>
                        `
                            : ""
                        }
                        ${
                          hasDiscount
                            ? `
                            <span class="product-card__badge product-card__badge--discount">
                                ${discount}% OFF
                            </span>
                        `
                            : ""
                        }
                    </div>

                    <!-- Image -->
                    <div class="product-card__image-container">
                        <img
                            src="${product.image_url}"
                            alt="${product.title}"
                            class="product-card__image"
                            loading="lazy"
                            itemprop="image"
                        >
                    </div>

                    <!-- Content -->
                    <div class="product-card__content">
                        <h3 class="product-card__title" itemprop="name">
                            ${product.title}
                        </h3>

                        <!-- Price -->
                        <div class="product-card__price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                            ${
                              originalPrice && hasDiscount
                                ? `
                                <span class="product-card__price-original">
                                    R$ ${originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                            `
                                : ""
                            }

                            <div class="product-card__price-current">
                                <span class="product-card__price-symbol">R$</span>
                                <span class="product-card__price-integer" itemprop="price" content="${product.price?.current}">
                                    ${price.integer}
                                </span>
                                <span class="product-card__price-decimals">${price.decimals}</span>

                                ${
                                  hasDiscount
                                    ? `
                                    <span class="product-card__price-discount">${discount}% OFF</span>
                                `
                                    : ""
                                }
                            </div>

                            <meta itemprop="priceCurrency" content="BRL">
                            <link itemprop="availability" href="https://schema.org/InStock">
                        </div>

                        <!-- Shipping -->
                        ${
                          hasFreeShipping
                            ? `
                            <div class="product-card__shipping">
                                <svg class="product-card__shipping-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.15 8a2 2 0 0 0-1.72-1H15V5a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 1 1.73 3.49 3.49 0 0 0 7 .27h4.19a3.5 3.5 0 0 0 6.78-.27A2 2 0 0 0 22 16v-5a1.91 1.91 0 0 0-.11-.62zM7 18.5A1.5 1.5 0 1 1 8.5 17 1.5 1.5 0 0 1 7 18.5zm10 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5z"/>
                                </svg>
                                <span>Frete grátis</span>
                                ${
                                  hasFulfillment
                                    ? `
                                    <span class="product-card__fulfillment">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                        </svg>
                                        FULL
                                    </span>
                                `
                                    : ""
                                }
                            </div>
                        `
                            : ""
                        }

                        <!-- CTA -->
                        <div class="product-card__cta">
                            Ver produto
                        </div>
                    </div>
                </a>
            </article>
        `;
  }

  /**
   * Render category section with products
   */
  function renderCategorySection(category) {
    const slug = slugify(category.name);
    const icon = getCategoryIcon(category.name);
    const productCount = category.products.length;

    const productsHtml = category.products
      .map((product) => renderProductCard(product, slug))
      .join("");

    return `
            <section
                class="category-section"
                id="section-${slug}"
                aria-labelledby="title-${slug}"
            >
                <header class="category-header">
                    <div class="category-icon">${icon}</div>
                    <h2 class="category-title" id="title-${slug}">
                        ${category.name}
                        <span class="category-count">(${productCount} produtos)</span>
                    </h2>
                </header>

                <div class="products-grid">
                    ${productsHtml}
                </div>
            </section>
        `;
  }

  /**
   * Render all products
   */
  function renderProducts(categories) {
    const html = categories
      .map((category) => renderCategorySection(category))
      .join("");

    elements.productsContainer.innerHTML = html;
  }

  /**
   * Update statistics
   */
  function updateStats(data) {
    const totalProducts = data.categories.reduce(
      (sum, cat) => sum + cat.products.length,
      0,
    );

    // Animate numbers
    animateNumber(elements.totalProducts, totalProducts);
    animateNumber(elements.totalCategories, data.categories.length);
  }

  /**
   * Animate number counting
   */
  function animateNumber(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);

      element.textContent = current.toLocaleString("pt-BR");

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Show error message
   */
  function showError(message) {
    elements.productsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <p style="font-size: 1.25rem; margin-bottom: 1rem;">😕</p>
                <p>${message}</p>
            </div>
        `;
  }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handle category button click
   */
  function handleCategoryClick(event) {
    const btn = event.target.closest(".category-btn");
    if (!btn) return;

    const categorySlug = btn.dataset.category;
    const section = document.getElementById(`section-${categorySlug}`);

    if (section) {
      // Update active state
      document.querySelectorAll(".category-btn").forEach((b) => {
        b.classList.remove("category-btn--active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("category-btn--active");
      btn.setAttribute("aria-selected", "true");

      // Scroll to section
      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  /**
   * Handle scroll for back to top button
   */
  const handleScroll = debounce(() => {
    const scrollY = window.scrollY;

    if (scrollY > 500) {
      elements.backToTop.classList.add("back-to-top--visible");
    } else {
      elements.backToTop.classList.remove("back-to-top--visible");
    }

    // Update active category based on scroll position
    updateActiveCategoryOnScroll();
  }, 100);

  /**
   * Update active category based on scroll position
   */
  function updateActiveCategoryOnScroll() {
    const sections = document.querySelectorAll(".category-section");
    const scrollY = window.scrollY + 200;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const slug = section.id.replace("section-", "");

      if (scrollY >= top && scrollY < top + height) {
        const btn = document.querySelector(
          `.category-btn[data-category="${slug}"]`,
        );
        if (btn && !btn.classList.contains("category-btn--active")) {
          document.querySelectorAll(".category-btn").forEach((b) => {
            b.classList.remove("category-btn--active");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("category-btn--active");
          btn.setAttribute("aria-selected", "true");

          // Scroll button into view in the nav
          btn.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    });
  }

  /**
   * Handle back to top click
   */
  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Hide loading overlay
   */
  function hideLoading() {
    elements.loading.classList.add("loading--hidden");
    setTimeout(() => {
      elements.loading.style.display = "none";
    }, 300);
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Category navigation
    elements.categoriesList.addEventListener("click", handleCategoryClick);

    // Scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Back to top
    elements.backToTop.addEventListener("click", handleBackToTop);
  }

  /**
   * Main initialization
   */
  async function init() {
    try {
      // Load data
      const data = await loadProductsData();

      if (!data || !data.categories) {
        throw new Error("Invalid data format");
      }

      // Filter categories with products that have affiliate links
      const validCategories = data.categories.filter(
        (cat) => cat.products && cat.products.length > 0,
      );

      // Render UI
      renderCategoriesNav(validCategories);
      renderProducts(validCategories);
      updateStats({ categories: validCategories });

      // Initialize events
      initEventListeners();

      // Hide loading
      hideLoading();

      console.log("✅ Landing page initialized successfully");
      console.log(`📦 ${validCategories.length} categories loaded`);
    } catch (error) {
      console.error("Initialization error:", error);
      hideLoading();
      showError(
        "Ocorreu um erro ao carregar a página. Por favor, tente novamente.",
      );
    }
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
