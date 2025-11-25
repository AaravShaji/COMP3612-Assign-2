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

    // ADD TO CART
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
        showToast("Item added to cart!");
    };

    // RENDER CART VIEW
    window.renderCartView = function() {

        if (cart.length === 0) {
            cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
            sumMerch.textContent = "$0.00";
            sumShipping.textContent = "$0.00";
            sumTax.textContent = "$0.00";
            sumTotal.textContent = "$0.00";
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        cartContainer.innerHTML = "";

        let merchandiseTotal = 0;

        cart.forEach((item, index) => {

            const product = ClothifyData.getProductById(item.id);
            const subtotal = item.qty * item.price;
            merchandiseTotal += subtotal;

            const row = document.createElement("div");
            row.className = "cart-item";

            row.innerHTML = `
                <button class="remove-item-btn">–</button>
                <img src="images/${item.id}_a.jpg">
                <p>${item.name}</p>
                <p>${item.color || "-"}</p>
                <p>${item.size || "-"}</p>
                <p>$${item.price.toFixed(2)}</p>
                <p>${item.qty}</p>
                <p>$${subtotal.toFixed(2)}</p>
            `;

            row.querySelector(".remove-item-btn").onclick = () => {
                cart.splice(index, 1);
                saveCart();
                renderCartView();
            };

            cartContainer.appendChild(row);
        });

        // Summary
        sumMerch.textContent = `$${merchandiseTotal.toFixed(2)}`;

        const shippingCost = calculateShipping(merchandiseTotal);
        sumShipping.textContent = `$${shippingCost.toFixed(2)}`;

        const tax = shipDestination.value === "CA"
            ? merchandiseTotal * 0.05
            : 0;

        sumTax.textContent = `$${tax.toFixed(2)}`;

        const total = merchandiseTotal + shippingCost + tax;
        sumTotal.textContent = `$${total.toFixed(2)}`;
    };

    // SHIPPING CALCULATOR
    function calculateShipping(total) {
        if (total > 500) return 0;

        const dest = shipDestination.value;
        const method = shipMethod.value;

        const table = {
            CA: { Standard: 10, Express: 25, Priority: 35 },
            US: { Standard: 15, Express: 25, Priority: 50 },
            INT: { Standard: 20, Express: 30, Priority: 50 }
        };

        return table[dest][method];
    }

    shipMethod.addEventListener("change", renderCartView);
    shipDestination.addEventListener("change", renderCartView);

    // CHECKOUT
    checkoutBtn.addEventListener("click", () => {
        showToast("Checkout successful!");
        cart = [];
        saveCart();
        renderCartView();

        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById("view-home").classList.add("active");
    });

    function showToast(msg) {
        const toast = document.getElementById("cartToast");
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }
});
