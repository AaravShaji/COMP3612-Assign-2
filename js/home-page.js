document.addEventListener("DOMContentLoaded", () => {

    const featuredCards = document.querySelectorAll(".featured-grid .product-preview");

    ClothifyData.loadProducts().then((products) => {

        /*
         * RANDOMLY SELECT 3 PRODUCTS
         * https://medium.com/@apestruy/shuffling-an-array-in-javascript-8fcbc5ff12c7
         */
        const shuffled = products
            .map(x => ({ x, rand: Math.random() }))
            .sort((a, b) => a.rand - b.rand)
            .map(x => x.x);

        const featured = shuffled.slice(0, 3);

        /*Update the 3 featured Cards*/

        featured.forEach((prod, i) => {
            const card = featuredCards[i];
            if (!card) return;

            const title = card.querySelector("h4");
            title.textContent = prod.name;

            const desc = card.querySelector("p:not(.product-price)");
            if (desc) desc.textContent = prod.description || "Modern • Stylish";

                // Update product image based on ID
                const img = card.querySelector("img");
                img.src = `images/${prod.id}_a.jpg`;
                img.alt = prod.name;

                // ⭐ MAKE CARD CLICKABLE → OPEN PRODUCT VIEW
                card.style.cursor = "pointer";
                card.addEventListener("click", () => openProductView(prod.id));
                img.addEventListener("click", () => openProductView(prod.id));
            });
        })
        .catch(err => console.error("ERROR LOADING FEATURED PRODUCTS:", err));
});

