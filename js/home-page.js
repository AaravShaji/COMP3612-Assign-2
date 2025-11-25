/* ============================= */
/* HOME PAGE FEATURED PRODUCTS JAVASCRIPT */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {
    const FEATURED_API = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";

    const featuredCards = document.querySelectorAll(".featured-grid .product-preview");

    fetch(FEATURED_API)
        .then(res => res.json())
        .then(data => {

            /*********************************************************
             * RANDOMLY SELECT 3 PRODUCTS
             * https://medium.com/@apestruy/shuffling-an-array-in-javascript-8fcbc5ff12c7
             *********************************************************/
            const shuffled = data
                .map(x => ({ x, rand: Math.random() }))
                .sort((a, b) => a.rand - b.rand)
                .map(x => x.x);

            const featured = shuffled.slice(0, 3);

            /*********************************************************
             * UPDATE THE 3 FEATURED CARDS
             *********************************************************/
            featured.forEach((prod, i) => {
                const card = featuredCards[i];
                if (!card) return;

                // Update product name
                const title = card.querySelector("h4");
                title.textContent = prod.name;

                // Update product description (FIRST <p>)
                const desc = card.querySelector("p:not(.product-price)");
                if (desc) desc.textContent = prod.description || "Modern • Stylish";

                // Update product price
                const price = card.querySelector(".product-price");
                price.textContent = `$${prod.price}`;

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
