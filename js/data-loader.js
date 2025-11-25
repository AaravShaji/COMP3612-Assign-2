const DATA_URL = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";
const STORAGE_KEY = "clothify-products-v1";

let productsCache = [];

function loadProducts() {
    if (productsCache.length > 0) {
        return Promise.resolve(productsCache);
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                productsCache = parsed;
                return Promise.resolve(productsCache);
            }
        } catch (err) {
            console.warn("Failed to parse products from localStorage, refetching…", err);
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    return fetch(DATA_URL)
        .then((response) => {
            if (!response.ok) { //Credit to: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
                throw new Error("Network response was not ok: " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            if (!Array.isArray(data)) {
                throw new Error("Expected an array of products from API");
            }

            productsCache = data;

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (err) {
                console.log(err);
            }

            return productsCache;
        })
        .catch((err) => {
            console.error("Error loading products:", err);
            return [];
        });
}

// HELPER FUNCTIONS 

function getAllProducts() {
    return productsCache.slice(); // return a copy
}

/** Find a single product by id (e.g., "P017"). */
function getProductById(id) {
    return productsCache.find((p) => p.id === id) || null;
}

/** Get all products for a given gender: "mens" or "womens". */
function getProductsByGender(gender) {
    return productsCache.filter((p) => p.gender === gender);
}

/** Get unique categories for a given gender, sorted alphabetically. */
function getCategoriesForGender(gender) {
    const set = new Set();
    productsCache.forEach((p) => {
        if (p.gender === gender) {
            set.add(p.category);
        }
    });
    return Array.from(set).sort();
}

// Expose a simple global namespace so other scripts can call it.
window.ClothifyData = {
    loadProducts,
    getAllProducts,
    getProductById,
    getProductsByGender,
    getCategoriesForGender
};