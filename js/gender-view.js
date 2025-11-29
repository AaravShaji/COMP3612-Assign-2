/*=============================================================
/* CATEGORY THUMBNAIL IMAGE LOADING + CATEGORY CARD NAVIGATION
/*=============================================================
    This script:
   • Loads the product list (once, via ClothifyData.loadProducts)
   • Chooses 1 representative product per category
   • Sets the category card thumbnail image automatically
   • Makes each category card open the Browse page
   • Applies gender + category filters instantly
*/

document.addEventListener("DOMContentLoaded", () => {
    if (!window.ClothifyData || typeof ClothifyData.loadProducts !== "function") {
        console.warn("ClothifyData not available yet – gender thumbnails not initialized.");
        return;
    }

    ClothifyData.loadProducts() //Load product data and fill category thumbnails
        .then(products => {
            const cards = document.querySelectorAll(".category-card");
            cards.forEach(card => {
                const genderAttr = card.dataset.gender;   
                const uiCategory = card.dataset.category; 

                const product = pickProductForCategory(products, genderAttr, uiCategory);
                if (!product) return;

                const thumb = card.querySelector(".category-thumb");
                if (!thumb) return;

                // removes the placeholder text
                const placeholder = thumb.querySelector("span");
                if (placeholder) {
                    placeholder.remove();
                }

                thumb.style.backgroundImage = `url(images/${product.id.toLowerCase()}_a.jpg)`;
                thumb.style.backgroundSize = "cover";
                thumb.style.backgroundPosition = "center";
                thumb.style.backgroundRepeat = "no-repeat";
            });
        })
        .catch(err => console.error("ERROR setting gender thumbnails:", err));
    
    /*-----------------------------
    /* CATEGORY CARD CLICK HANDLER
    /*-----------------------------
       When the user clicks a category, automatically:

      • Switch to Browse View
      • Apply correct gender filter
      • Apply correct category filter
      • Trigger BrowseView filtering
    */
    document.addEventListener("click", async (e) => {
        const card = e.target.closest(".category-card");
        if (!card) return;

        const gender = card.dataset.gender;       // "women" or "men"
        const category = card.dataset.category;   // "outerwear", "dresses", etc.

        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById("view-browse").classList.add("active");

        document.querySelectorAll("#filter-gender input, #filter-category input")
            .forEach(cb => cb.checked = false);

        const genderBox = document.querySelector(`#filter-gender input[value="${gender}s"]`);
        if (genderBox) {
            genderBox.checked = true;
            genderBox.dispatchEvent(new Event("change")); // Credit to: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
        }

        // Apply category checkbox
        const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
        const catBox = document.querySelector(`#filter-category input[value="${catLabel}"]`);
        if (catBox) {
            catBox.checked = true;
            catBox.dispatchEvent(new Event("change"));
        }

        // Force browse filtering + tag rendering
        if (window.BrowseView && typeof BrowseView.applyFilters === "function") {
            BrowseView.applyFilters();
        }
        if (window.BrowseView && typeof BrowseView.renderFilterTags === "function") {
            BrowseView.renderFilterTags();
        }

        document.getElementById("browseGrid")?.scrollIntoView({ behavior: "smooth" });
    });

});

/* Function: pickProductForCategory()
 *
 * Given the full product list, gender, and category
 * return ONE representative product that matches.
 *
 * This is used to choose which product image is shown
 * on each category card thumbnail.
 */
function pickProductForCategory(allProducts, uiGender, uiCategory) {
    const genderKey = uiGender === "women" ? "womens" : "mens";

    const byGender = allProducts.filter(p => p.gender === genderKey);

    const lowerCat = uiCategory.toLowerCase();

    switch (lowerCat) { //credit to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
        case "outerwear":
            return byGender.find(p => p.category === "Outerwear");
        case "dresses":
            return byGender.find(p => p.category === "Dresses");
        case "accessories":
            return byGender.find(p => p.category === "Accessories");
        case "shoes":
        case "footwear":
            return byGender.find(p => p.category === "Shoes");
        case "loungewear":
            return byGender.find(p => p.category === "Loungewear");
        case "jumpsuits":
            return byGender.find(p => p.category === "Jumpsuits");
        case "swimwear":
            return byGender.find(p => p.category === "Swimwear");
        case "intimates":
            return byGender.find(p => p.category === "Intimates"); 
        case "bottoms":
            return byGender.find(p => p.category === "Bottoms");
        case "tops":
            return byGender.find(p => p.category === "Tops");
        case "sweaters":
            return byGender.find(p => p.category === "Sweaters");
        default:
            return byGender[0];
    }
}