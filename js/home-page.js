/*=======================
/* HOME PAGE JAVASCRIPT
/*=======================
   This script handles:
   - Loading product data (via ClothifyData)
   - Randomly selecting 3 products to feature
   - Updating the Featured Products section
   - Making featured cards clickable to open the product view
 */

document.addEventListener("DOMContentLoaded", () => {

    const featuredCards = document.querySelectorAll(".featured-grid .product-preview");

    // Load all product data (from localStorage or fetch API)
    ClothifyData.loadProducts().then((products) => {

        /*---------------------------
           RANDOMLY SELECT 3 PRODUCTS
          ---------------------------
           Uses “decorate-sort-undecorate” shuffle:
           1. Attach a random number to each item
           2. Sort by the random number
           3. Remove the wrapper and extract products back out

            Source: https://medium.com/@apestruy/shuffling-an-array-in-javascript-8fcbc5ff12c7
        */
        const shuffled = products
            .map(x => ({ x, rand: Math.random() }))
            .sort((a, b) => a.rand - b.rand)
            .map(x => x.x);

        const featured = shuffled.slice(0, 3);

        /* ----------------------------------------
           UPDATE THE 3 FEATURED CARD DOM ELEMENTS
           ----------------------------------------
           For each placeholder:
           - Update name, description, price
           - Update image source
           - Make the card clickable (open full product view)
        */
        featured.forEach((prod, i) => {
            const card = featuredCards[i];
            if (!card) return;

            const title = card.querySelector("h4");
            title.textContent = prod.name;

            const desc = card.querySelector("p:not(.product-price)");
            if (desc) desc.textContent = prod.description || "Modern • Stylish";

                // Update product image based on ID
                const img = card.querySelector("img");
                img.src = `images/${prod.id.toLowerCase()}_a.jpg`;
                img.alt = prod.name;

                //  MAKE CARD CLICKABLE → OPEN PRODUCT VIEW
                card.style.cursor = "pointer";
                card.addEventListener("click", () => openProductView(prod.id));
                img.addEventListener("click", () => openProductView(prod.id));
            });
        })
        .catch(err => console.error("ERROR LOADING FEATURED PRODUCTS:", err));
});

