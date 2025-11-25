/* ============================= */
/* SINGLE PRODUCT VIEW JAVASCRIPT */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {

    let allProducts = [];

    // DOM elements
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

    // Load product list
    ClothifyData.loadProducts().then(data => {
        allProducts = data;
    });

    // =====================================================
    // OPEN PRODUCT VIEW
    // =====================================================
    window.openProductView = function(productId) {

        const prod = ClothifyData.getProductById(productId);
        if (!prod) return;

        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        viewProduct.classList.add("active");

        // Breadcrumb
        breadcrumb.innerHTML = `
            <a data-view="home" class="nav-link">Home</a> >
            <a data-view="browse" class="nav-link">${prod.gender}</a> >
            <a data-view="browse" class="nav-link">${prod.category}</a> >
            ${prod.name}
        `;

        // Details
        titleEl.textContent = prod.name;
        priceEl.textContent = `$${prod.price}`;
        descEl.textContent = prod.description;
        matEl.textContent = prod.material || "Cotton blend";

        // Main image
        mainImg.src = `images/${prod.id}_a.jpg`;

        // Thumbnails
        thumbs.innerHTML = "";
        ["a", "b"].forEach(letter => {
            const img = document.createElement("img");
            img.src = `images/${prod.id}_${letter}.jpg`;
            img.className = "product-thumb";
            img.onclick = () => (mainImg.src = img.src);
            thumbs.appendChild(img);
        });

        // Sizes
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

        // Colors
        colorContainer.innerHTML = "";
        (prod.color || []).forEach(color => {
            const swatch = document.createElement("span");
            swatch.className = "color-swatch";
            swatch.style.background = color.hex;
            colorContainer.appendChild(swatch);
        });

        // Related
        renderRelatedProducts(prod);

        // ADD TO CART
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

    // =====================================================
    // Related Products
    // =====================================================
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
                <img src="images/${r.id}_a.jpg">
                <h4>${r.name}</h4>
                <p>$${r.price}</p>
            `;
            relatedContainer.appendChild(card);
        });
    }

    // Toast
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }
});
