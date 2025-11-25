document.addEventListener("DOMContentLoaded", () => {

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

    // --------- Load products using data-loader.js ----------
    ClothifyData.loadProducts().then(data => {
        state.products = data;
        applyFiltersAndRender();
    });

    // --------- Event listeners for filters ----------
    filterCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const type = cb.dataset.filter;
            const value = cb.value;

            if (cb.checked) state.filters[type].add(value);
            else state.filters[type].delete(value);

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
            filterCheckboxes.forEach(cb => cb.checked = false);
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

    // AND logic across filter groups
    function matchesAllFilters(prod) {

        if (state.filters.gender.size > 0 &&
            !state.filters.gender.has(prod.gender)) return false;

        if (state.filters.category.size > 0 &&
            !state.filters.category.has(prod.category)) return false;

        if (state.filters.size.size > 0) {
            const sizes = Array.isArray(prod.sizes) ? prod.sizes : [prod.sizes];
            const matchSize = sizes.some(s => state.filters.size.has(s));
            if (!matchSize) return false;
        }

        if (state.filters.color.size > 0) {
            const colors = prod.colors?.map(c => c.name) || [];
            const matchColor = colors.some(c => state.filters.color.has(c));
            if (!matchColor) return false;
        }

        return true;
    }

    function sortProducts(items, sortBy) {
        const sorted = [...items];
        if (sortBy === "price") sorted.sort((a, b) => a.price - b.price);
        else if (sortBy === "category") sorted.sort((a, b) => a.category.localeCompare(b.category));
        else sorted.sort((a, b) => a.name.localeCompare(b.name));
        return sorted;
    }

    // ==================================================
    // Rendering helpers
    // ==================================================
    function renderGrid(items) {
        grid.innerHTML = "";

        if (items.length === 0) {
            grid.innerHTML = `<p class="no-results">No products match your filters.</p>`;
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

            // OPEN SINGLE PRODUCT VIEW
            card.addEventListener("click", e => {
                if (e.target.classList.contains("add-cart-btn")) return;
                openProductView(prod.id);
            });

            // ADD TO CART
            card.querySelector(".add-cart-btn").addEventListener("click", () => {
                addToCart(prod, 1, null, null);
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
                tag.textContent = value + " × ";

                tag.addEventListener("click", () => {
                    state.filters[type].delete(value);
                    const cb = document.querySelector(
                        `.browse-sidebar input[data-filter="${type}"][value="${value}"]`
                    );
                    if (cb) cb.checked = false;
                    applyFiltersAndRender();
                });

                filterTagsContainer.appendChild(tag);
            });
        });
    }
});
