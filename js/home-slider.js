/*=================================
/* HOME SLIDER ANIMATION JAVASCRIPT 
/*================================= 
/* This script dynamically loads 3 random product images from the
   Clothify dataset and uses them to build the hero image slider
   on the homepage.

   Responsibilities:
   - Fetch product data (from ClothifyData loader)
   - Randomly pick 3 products
   - Insert their images into the slider track
   - Initialize a simple auto-advancing carousel
*/

document.addEventListener("DOMContentLoaded", () => {

    const track = document.getElementById("heroSliderTrack");

    ClothifyData.loadProducts().then(products => { 
        const shuffled = products                   // credit to: https://medium.com/@apestruy/shuffling-an-array-in-javascript-8fcbc5ff12c7
            .map(p => ({ p, rnd: Math.random() }))
            .sort((a, b) => a.rnd - b.rnd)
            .map(x => x.p);

        const slides = shuffled.slice(0, 3);

        // Insert the 3 randomized slide images into the DOM
        slides.forEach(prod => {
            const img = document.createElement("img");

            img.classList.add("slide");
            img.src = `images/${prod.id.toLowerCase()}_a.jpg`;
            img.alt = prod.name;
            track.appendChild(img);
        });

        initHeroSlider();
    });
});

/*=================================
/* Initialize Auto-Sliding Carousel
/*=================================
   - Cycles through the inserted images every 3000 ms (3 sec)
   - Uses CSS transform: translateX() to slide the track
   - Updates a progress bar underneath the slider
*/
function initHeroSlider() {
    const track = document.getElementById("heroSliderTrack");
    const barFill = document.querySelector(".slider-bar-fill");
    const slides = document.querySelectorAll(".slide");
    const total = slides.length;

    let index = 0;

    /*==============
    /* rotateSlide()
    /*==============
       Moves the slider to the next image using translateX().
       Uses modulo (%) so the slider loops back to the first
       image automatically once the last one is reached.
     */
    function rotateSlide() {
        index = (index + 1) % total;

        // Credit: https://www.w3schools.com/cssref/func_translatex.php
        track.style.transform = `translateX(-${index * 100}%)`;

        barFill.style.width = `${((index + 1) / total) * 100}%`;
    }
    setInterval(rotateSlide, 3000);
}
