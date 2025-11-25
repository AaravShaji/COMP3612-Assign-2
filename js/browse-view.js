document.addEventListener("DOMContentLoaded", () => {
    const API_URL =
        "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";

    // DOM references
    const grid = document.getElementById("browseGrid");
    const sortSelect = document.getElementById("browse-sort");
    const clearAllBtn = document.getElementById("clearAllFilters");
    const filterTagsContainer = document.getElementById("filterTagsContainer");
    const filterCheckboxes = document.querySelectorAll(
        ".browse-sidebar input[type='checkbox'][data-filter]"
    );

    // Application state
    const state = {
        products: [],
        filters: {
            gender: new Set(),
            category: new Set(),
            size: new Set(),
            color: new Set()
        },
        sortBy: "name"
    };

    // --------- Fetch products and init ----------
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            state.products = data;
            applyFiltersAndRender();
        })
        .catch(err => {
            console.error("Error loading browse data:", err);
            grid.innerHTML = "<p>Unable to load products.</p>";
        });

    // --------- Event listeners for filters ----------
    filterCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const type = cb.dataset.filter;   // gender|category|size|color
            const value = cb.value;
            if (cb.checked) {
                state.filters[type].add(value);
            } else {
                state.filters[type].delete(value);
            }
            applyFiltersAndRender();
        });
    });

    // Sort selector
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            state.sortBy = sortSelect.value;
            applyFiltersAndRender();
        });
    }

    // Clear All Filters
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", () => {
            Object.values(state.filters).forEach(set => set.clear());
            filterCheckboxes.forEach(cb => (cb.checked = false));
            applyFiltersAndRender();
        });
    }

    // ==================================================
    // Core logic: filter + sort + render
    // ==================================================
    function applyFiltersAndRender() {
        let items = state.products.filter(matchesAllFilters);
        items = sortProducts(items, state.sortBy);
        renderGrid(items);
        renderFilterTags();
    }

    // AND logic across filter groups, OR within each group
    function matchesAllFilters(prod) {
        // Gender
        if (state.filters.gender.size > 0 &&
            !state.filters.gender.has(prod.gender)) {
            return false;
        }

        // Category
        if (state.filters.category.size > 0 &&
            !state.filters.category.has(prod.category)) {
            return false;
        }

        // Sizes (product.sizes is usually an array)
        if (state.filters.size.size > 0) {
            const sizes = Array.isArray(prod.sizes) ? prod.sizes : [prod.sizes];
            const hasSize = sizes.some(s => state.filters.size.has(s));
            if (!hasSize) return false;
        }

        // Colors (product.color can be string or array)
        if (state.filters.color.size > 0) {
            const colors = Array.isArray(prod.color) ? prod.color : [prod.color];
            const hasColor = colors.some(c => state.filters.color.has(c));
            if (!hasColor) return false;
        }

        return true;
    }

    function sortProducts(items, sortBy) {
        const copy = [...items];
        switch (sortBy) {
            case "price":
                copy.sort((a, b) => a.price - b.price);
                break;
            case "category":
                copy.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case "name":
            default:
                copy.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        return copy;
    }

    // ==================================================
    // Rendering helpers
    // ==================================================
    function renderGrid(items) {
        grid.innerHTML = "";

        if (items.length === 0) {
            grid.innerHTML =
                '<p class="no-results">No products match your current filters.</p>';
            return;
        }

        items.forEach(prod => {
            const card = document.createElement("div");
            card.className = "browse-product-card";

            card.innerHTML = `
                <img src="images/${prod.id}_a.jpg" alt="${prod.name}">
                <h4>${prod.name}</h4>
                <p>$${prod.price}</p>
                <button class="add-cart-btn" data-id="${prod.id}">+</button>
            `;

            // Open single product view when clicking image or card
            card.addEventListener("click", (e) => {
                // Prevent "+" button from triggering single view
                if (e.target.classList.contains("add-cart-btn")) return;

                openProductView(prod.id);   // ⭐ integrated
            });

            card.querySelector("img").addEventListener("click", () => openProductView(prod.id));
            card.querySelector("h4").addEventListener("click", () => openProductView(prod.id));

            // Add to cart button
            card.querySelector(".add-cart-btn").addEventListener("click", () => {
                console.log("Add to cart:", prod.id);
                // call your real addToCart(prod) function here if you have one
            });

            grid.appendChild(card);
            card.classList.add("card-fade-in");
        });
    }

    function renderFilterTags() {
        filterTagsContainer.innerHTML = "";

        Object.entries(state.filters).forEach(([type, set]) => {
            set.forEach(value => {
                const tag = document.createElement("button");
                tag.className = "filter-tag";
                tag.textContent = value + " ×";
                tag.dataset.filterType = type;
                tag.dataset.filterValue = value;
                tag.addEventListener("click", () => {
                    removeFilter(type, value);
                });
                filterTagsContainer.appendChild(tag);
            });
        });
    }

    function removeFilter(type, value) {
        state.filters[type].delete(value);

        // Uncheck corresponding checkbox
        const selectorValue =
            window.CSS && CSS.escape ? CSS.escape(value) : value;
        const cb = document.querySelector(
            `.browse-sidebar input[data-filter="${type}"][value="${selectorValue}"]`
        );
        if (cb) cb.checked = false;

        applyFiltersAndRender();
    }
});
