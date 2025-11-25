/* ============================================================
   CART VIEW JAVASCRIPT
   ------------------------------------------------------------
   Responsibilities:
   - Store and load cart data from localStorage
   - Keep the cart badge count in sync
   - Render the cart items list
   - Handle quantity changes and item removal
   - Calculate shipping, tax, and totals
   - Validate checkout and clear cart on success
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    // DOM Element References
    const cartContainer     = document.getElementById("cartContainer");
    const badge             = document.getElementById("cartCountBadge");
    const shipMethod        = document.getElementById("shipMethod");
    const shipDestination   = document.getElementById("shipDestination");
    const sumMerch          = document.getElementById("sumMerch");
    const sumShipping       = document.getElementById("sumShipping");
    const sumTax            = document.getElementById("sumTax");
    const sumTotal          = document.getElementById("sumTotal");
    const checkoutBtn       = document.getElementById("checkoutBtn");
    const toast             = document.getElementById("cartToast");

    let cart = JSON.parse(localStorage.getItem("CLOTHIFY_CART") || "[]");

    /** Persist cart to localStorage and update badge counter. */
    function saveCart() {
        localStorage.setItem("CLOTHIFY_CART", JSON.stringify(cart));
        updateBadge();
    }

    /** Update the cart badge to show total quantity of all items. */
    function updateBadge() {
        badge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    updateBadge();


    /*==================================================
    /* ADD TO CART (GLOBAL FUNCTION)
    /*==================================================
    /*
     * window.addToCart is called from the product view when user clicks
     * "Add to Cart". It:
     *  - finds existing line with same product + size + color
     *  - increments quantity OR adds a new line
     *  - saves and shows a toast
     */
    window.addToCart = function(product, qty = 1, size = "default", color = "default") {

        const existing = cart.find(
            c => c.id === product.id && c.size === size && c.color === color
        );

        if (existing) existing.qty += qty;
        else cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size: size || "default",
            color: color || "default",
            qty
        });

        saveCart();
        showToast("Added to cart!");
    };


    /*==================================================
    /* RENDER CART VIEW
    /*==================================================
    /*
     * window.renderCartView:
     *  - Shows "empty cart" message if nothing in cart
     *  - Otherwise creates a row for each cart item with:
     *      thumbnail, name, size/color, price, qty controls, subtotal, remove button
     *  - Recalculates the summary totals (merch, ship, tax, total)
     */
    window.renderCartView = function() {

        if (cart.length === 0) {
            cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
            updateSummary(0);
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        cartContainer.innerHTML = "";

        let merchandiseTotal = 0;

        cart.forEach((item, index) => {

            const prod = ClothifyData.getProductById(item.id);
            const subtotal = item.qty * item.price;
            merchandiseTotal += subtotal;

            const row = document.createElement("div");
            row.className = "cart-item fadeIn";

            row.innerHTML = `
                <img src="images/${item.id}_a.jpg" class="cart-thumb">

                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="small-label">Color: <strong>${item.color === "default" ? "Default" : item.color}</strong></p>
                    <p class="small-label">Size: <strong>${item.size === "default" ? "Default" : item.size}</strong></p>

                </div>

                <p class="cart-price">$${item.price.toFixed(2)}</p>

                <div class="cart-qty-controls">
                    <button class="qty-btn dec">–</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn inc">+</button>
                </div>

                <p class="cart-subtotal">$${subtotal.toFixed(2)}</p>

                <button class="remove-item-btn">✕</button>
            `;

            /* Quantity + and – */
            row.querySelector(".inc").onclick = () => {
                item.qty++;
                saveCart();
                renderCartView();
            };

            row.querySelector(".dec").onclick = () => {
                if (item.qty > 1) item.qty--;
                else cart.splice(index, 1);
                saveCart();
                renderCartView();
            };

            /* Remove button */
            row.querySelector(".remove-item-btn").onclick = () => {
                cart.splice(index, 1);
                saveCart();
                renderCartView();
            };

            cartContainer.appendChild(row);
        });

        updateSummary(merchandiseTotal);
    };


    /*==================================================
    /* UPDATE SUMMARY (MERCH, SHIPPING, TAX, TOTAL)
    /*==================================================
    /*
     * Recomputes:
     *  - Merchandise subtotal
     *  - Shipping cost (based on method + destination)
     *  - Tax (5% for Canada only)
     *  - Final total
     */
    function updateSummary(merchTotal) {

        sumMerch.textContent = `$${merchTotal.toFixed(2)}`;

        const shippingCost = calculateShipping(merchTotal);
        sumShipping.textContent = `$${shippingCost.toFixed(2)}`;

        // Only Canada gets tax
        const tax = shipDestination.value === "CA"
            ? merchTotal * 0.05
            : 0;

        sumTax.textContent = `$${tax.toFixed(2)}`;

        const finalTotal = merchTotal + shippingCost + tax;
        sumTotal.textContent = `$${finalTotal.toFixed(2)}`;
    }


    /*=====================
    /* SHIPPING CALCULATOR
    /*=====================
    /*
     * calculateShipping(total):
     *  - Free shipping if total >= $500
     *  - Otherwise, shipping based on:
     *      • Destination (CA / US / INT)
     *      • Method (Standard / Express / Priority)
     */
    function calculateShipping(total) {
        if (total === 0) return 0;
        if (total >= 500) return 0;

        const table = {
            CA: { Standard: 10, Express: 25, Priority: 35 },
            US: { Standard: 15, Express: 25, Priority: 50 },
            INT: { Standard: 20, Express: 30, Priority: 50 }
        };

        return table[shipDestination.value][shipMethod.value];
    }


    shipMethod.addEventListener("change", () => renderCartView());
    shipDestination.addEventListener("change", () => renderCartView());


    /*==================
    /* CHECKOUT HANDLING
    /*==================
    /*
     * On checkout:
     *  - Validate that shipping method & destination are selected
     *  - Highlight invalid fields
     *  - If valid: show success toast, clear cart, re-render, go home
     */
    checkoutBtn.addEventListener("click", () => {

        const shipWarn  = document.getElementById("shipWarning");
        const method    = shipMethod.value.trim();
        const dest      = shipDestination.value.trim();

        let valid = true;

        shipMethod.classList.remove("invalid");
        shipDestination.classList.remove("invalid");

        // Validation check
        if (!method) {
            shipMethod.classList.add("invalid");
            valid = false;
        }

        if (!dest) {
            shipDestination.classList.add("invalid");
            valid = false;
        }

        if (!valid) {
            shipWarn.style.display = "block";
            requestAnimationFrame(() => shipWarn.style.opacity = "1");
            return;
        }

        // If both are selected → allow checkout
        shipWarn.style.opacity = "0";
        setTimeout(() => (shipWarn.style.display = "none"), 300);

        showToast("Checkout successful!");

        cart = [];
        saveCart();
        renderCartView();

        // Return to home after checkout
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById("view-home").classList.add("active");
    });

    // When the user clicks the Cart button in navbar, refresh contents
    document.querySelector(".cart-btn").addEventListener("click", () => {
        renderCartView();
    });

    /*======================
    /* TOAST MESSAGE HELPER
    /*======================
    /*
     * showToast(msg):
     *  - Briefly shows a toast message at the bottom/top of the screen
     *  - Used for: "Added to cart!" and "Checkout successful!"
     */
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }
});
