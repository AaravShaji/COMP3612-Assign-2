document.addEventListener("DOMContentLoaded", () => {

    const cartContainer = document.getElementById("cartContainer");
    const badge = document.getElementById("cartCountBadge");

    const shipMethod = document.getElementById("shipMethod");
    const shipDestination = document.getElementById("shipDestination");

    const sumMerch = document.getElementById("sumMerch");
    const sumShipping = document.getElementById("sumShipping");
    const sumTax = document.getElementById("sumTax");
    const sumTotal = document.getElementById("sumTotal");

    const checkoutBtn = document.getElementById("checkoutBtn");

    const toast = document.getElementById("cartToast");

    // CART STORAGE
    let cart = JSON.parse(localStorage.getItem("CLOTHIFY_CART") || "[]");

    function saveCart() {
        localStorage.setItem("CLOTHIFY_CART", JSON.stringify(cart));
        updateBadge();
    }

    function updateBadge() {
        badge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    }

    updateBadge();


    /* ==========================
       ADD TO CART (Called globally)
    ========================== */
    window.addToCart = function(product, qty = 1, size = null, color = null) {

        const existing = cart.find(
            c => c.id === product.id && c.size === size && c.color === color
        );

        if (existing) existing.qty += qty;
        else cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            size,
            color,
            qty
        });

        saveCart();
        showToast("Added to cart!");
    };


    /* ==========================
       RENDER CART VIEW
    ========================== */
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
                    <p class="small-label">Color: <strong>${item.color || "-"}</strong></p>
                    <p class="small-label">Size: <strong>${item.size || "-"}</strong></p>
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


    /* ==========================
       UPDATE SUMMARY
    ========================== */
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


    /* ==========================
       SHIPPING CALCULATOR
    ========================== */
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


    /* ==========================
       CHECKOUT
    ========================== */
    checkoutBtn.addEventListener("click", () => {
        showToast("Checkout successful!");
        cart = [];
        saveCart();
        renderCartView();

        // Return to home
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById("view-home").classList.add("active");
    });


    /* ==========================
       Toast Message
    ========================== */
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }
});
