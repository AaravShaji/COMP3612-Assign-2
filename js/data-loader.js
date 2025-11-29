/*============================================================
/*  DATA LOADING + LOCAL STORAGE CACHING 
/*------------------------------------------------------------
   This file is responsible for:

   Fetching the product JSON data from the API
   Caching it in localStorage so we only fetch ONCE
   Exposing helper functions so other scripts can access data
   ============================================================ */

const DATA_URL = "https://gist.githubusercontent.com/rconnolly/d37a491b50203d66d043c26f33dbd798/raw/37b5b68c527ddbe824eaed12073d266d5455432a/clothing-compact.json";
const STORAGE_KEY = "clothify-products-v1";

let productsCache = [];

/* ============================================================
   loadProducts()
   ------------------------------------------------------------
   Loads product data using the following rules:

   1. If products are already in memory → return immediately
   2. Else if products exist in localStorage → parse + return
   3. Else fetch from API → store in memory + localStorage
   ============================================================ */
function loadProducts() {

    // --- Rule 1: Already loaded in memory ---
    if (productsCache.length > 0) { 
        return Promise.resolve(productsCache); // Credit to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
    }

    // --- Rule 2: Check localStorage ---
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

    // --- Rule 3: Fetch from API ---
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

/* ============================================================
   HELPER FUNCTIONS (IF NEEDED)

   These provide safe, read-only access to the data for other
   scripts such as home-page.js, browse.js, product.js, etc.
   ============================================================ */ 
function getAllProducts() {
    return productsCache.slice(); 
}

function getProductById(id) {
    return productsCache.find((p) => p.id === id) || null;
}

function getProductsByGender(gender) {
    return productsCache.filter((p) => p.gender === gender);
}

function getCategoriesForGender(gender) {
    const set = new Set();
    productsCache.forEach((p) => {
        if (p.gender === gender) {
            set.add(p.category);
        }
    });
    return Array.from(set).sort();
}

/* ============================================================
   Expose API Globally
   ------------------------------------------------------------
   Makes ClothifyData available to:
   - home-page.js
   - gender.js
   - browse.js
   - product.js
   - hero-slider.js

   Window property help credit: https://developer.mozilla.org/en-US/docs/Web/API/Window/window
   ============================================================ */
window.ClothifyData = {
    loadProducts,
    getAllProducts,
    getProductById,
    getProductsByGender,
    getCategoriesForGender
};