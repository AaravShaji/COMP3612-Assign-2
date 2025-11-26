/* ============================== 
/* SINGLE PRODUCT VIEW JAVASCRIPT 
/* ============================== 
/*  This script handles:
  - Opening the single-product view when a product is selected
  - Populating product details (images, name, price, description, etc.)
  - Rendering size and color options
  - Wiring up "Add to Cart"
  - Showing a small "related products" section
*/

document.addEventListener("DOMContentLoaded", () => {

    let allProducts = [];

    // DOM element References 
    const viewProduct = document.getElementById("view-product");
    const breadcrumb = document.getElementById("productBreadcrumb");
    const mainImg = document.getElementById("productMainImg");
    const titleEl = document.getElementById("productTitle");
    const priceEl = document.getElementById("productPrice");
    const descEl = document.getElementById("productDescription");
    const matEl = document.getElementById("productMaterial");
    const thumbs = document.getElementById("productThumbs");
    const sizeContainer = document.getElementById("productSizes");
    const colorContainer = document.getElementById("productColors");
    const qtyEl = document.getElementById("productQty");
    const addToCartBtn = document.getElementById("productAddToCart");
    const relatedContainer = document.getElementById("relatedProducts");

    /* ============================
    /* LOAD PRODUCT LIST (ONCE)
    /* ============================
    /*
     * Ask ClothifyData for the product list.
     * This uses the shared loader which either:
     *  - pulls from localStorage, or
     *  - fetches from the API and then caches it.
     */
    ClothifyData.loadProducts().then(data => {
        allProducts = data;
    });

    /* =========================
    /* OPEN PRODUCT VIEW
    /* =========================
    /* Expose a global function so other scripts can open a product:
     * - Used by home-page.js (featured products)
     * - Used by related products cards
    */
    window.openProductView = function(productId) {

        const prod = ClothifyData.getProductById(productId);
        if (!prod) return;

        // Switch SPA view: hide all, show only the product view
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        viewProduct.classList.add("active");

        breadcrumb.innerHTML = `
            <a data-view="home" class="nav-link">Home</a> >
            <a data-view="browse" class="nav-link">${prod.gender}</a> >
            <a data-view="browse" class="nav-link">${prod.category}</a> >
            ${prod.name}
        `;

        titleEl.textContent = prod.name;
        priceEl.textContent = `$${prod.price}`;
        descEl.textContent = prod.description;
        matEl.textContent = prod.material || "Cotton blend";

        mainImg.src = `images/${prod.id.toLowerCase()}_a.jpg`;

        thumbs.innerHTML = "";

        /*-------------------------------
        /* THUMBNAIL IMAGES
        /*-------------------------------
        /*
         * Clear any previous thumbnails, then add up to two:
         *   - _a.jpg
         *   - _b.jpg
         * Clicking a thumbnail replaces the main image.
         * Iterates through a and b then set image to ${id}_a and ${id}_b
         * https://forum.freecodecamp.org/t/its-this-a-good-way-to-create-a-image-loop/323175
         */
        ["a", "b"].forEach(letter => {
            const img = document.createElement("img");

            img.src = `images/${prod.id.toLowerCase()}_${letter}.jpg`;
            img.className = "product-thumb";
            img.onclick = () => (mainImg.src = img.src);
            thumbs.appendChild(img);
        });

        /*-------------------------------
        /* SIZE BUTTONS
        /*-------------------------------
        /*
         * Create one button per available size.
         * Clicking a size:
         *   - clears "active" from all other size buttons
         *   - marks the clicked button as "active"
         */
        sizeContainer.innerHTML = "";
        (prod.sizes || []).forEach(size => {
            const btn = document.createElement("button");
            btn.textContent = size;
            btn.onclick = () => {
                document.querySelectorAll("#productSizes button")
                    .forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            };
            sizeContainer.appendChild(btn);
        });

        /*-------------------------------
        /* COLOR SWATCHES
        /*-------------------------------
        /*
         * For each color in prod.colors, draw a small colored circle/box.
         * Note: here we only visually show colors; selection is simplified
         * to using the first color when adding to cart.
         */
        colorContainer.innerHTML = "";
        (prod.color || []).forEach(color => {
            const swatch = document.createElement("span");
            swatch.className = "color-swatch";
            swatch.style.background = color.hex;
            colorContainer.appendChild(swatch);
        });

        renderRelatedProducts(prod);

        /*-------------------------------
        /* ADD TO CART BUTTON BEHAVIOUR
        /*-------------------------------
        /*
         * When the user clicks "Add to Cart":
         *  1. Read quantity (default to 1 if invalid)
         *  2. Check if a size is required; if so, ensure one is selected
         *  3. For color, pick the first available color 
         *  4. Call addToCart(...) with all the details
         * https://www.w3schools.com/java/java_conditions_shorthand.asp
         */
        addToCartBtn.onclick = () => {
            const qty = parseInt(qtyEl.value) || 1;

            const selectedSizeBtn = document.querySelector("#productSizes button.active");
            const size = selectedSizeBtn ? selectedSizeBtn.textContent : null;

            if (prod.sizes && prod.sizes.length > 0 && !size) {
                showToast("Select a size first!");
                return;
            }

            const color = prod.colors?.length > 0
                ? prod.colors[0].name
                : null;

            addToCart(prod, qty, size, color);
        };
    };

    /*======================
    /* RELATED PRODUCTS
    /*======================
    /*
     * Build a simple "You may also like" / related products row.
     * Criteria:
     *   - Not the same product
     *   - Same category OR same gender as current product
     *   - Limit to 4 items
     * https://www.w3schools.com/jsref/jsref_slice_array.asp
     * https://www.freecodecamp.org/news/javascript-filter-method/
     */
    function renderRelatedProducts(prod) {
        relatedContainer.innerHTML = "";

        const related = ClothifyData.getAllProducts().filter(
            p =>
                p.id !== prod.id &&
                (p.category === prod.category || p.gender === prod.gender)
        ).slice(0, 4);

        related.forEach(r => {
            const card = document.createElement("div");
            card.className = "related-card";
            card.onclick = () => openProductView(r.id);

            card.innerHTML = `
                <img src="images/${r.id.toLowerCase()}_a.jpg">
                <h4>${r.name}</h4>
                <p>$${r.price}</p>
            `;
            relatedContainer.appendChild(card);
        });
    }

    /*=====================
    /* TOAST MESSAGE HELPER
    /*=====================
    /*
     * showToast(message)
     * Shows a temporary notification (e.g., "Select a size first!")
     * Assumes there is a #toast element in the HTML.
     */
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }
});
