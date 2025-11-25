/* ============================= */
/* HOME SLIDER ANIMATION JAVASCRIPT */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {

    const track = document.getElementById("heroSliderTrack");

    ClothifyData.loadProducts().then(products => { 
        const shuffled = products //credit to: https://medium.com/@apestruy/shuffling-an-array-in-javascript-8fcbc5ff12c7
            .map(p => ({ p, rnd: Math.random() }))
            .sort((a, b) => a.rnd - b.rnd)
            .map(x => x.p);

        const slides = shuffled.slice(0, 3);

        // Insert slider images dynamically
        slides.forEach(prod => {
            const img = document.createElement("img");

            img.classList.add("slide");
            img.src = `images/${prod.id}_a.jpg`;
            img.alt = prod.name;
            track.appendChild(img);
        });

        initHeroSlider();
    });
});

function initHeroSlider() {
    const track = document.getElementById("heroSliderTrack");
    const barFill = document.querySelector(".slider-bar-fill");
    const slides = document.querySelectorAll(".slide");
    const total = slides.length;

    let index = 0;
    function rotateSlide() {
        index = (index + 1) % total;

        // Credit: https://www.w3schools.com/cssref/func_translatex.php
        track.style.transform = `translateX(-${index * 100}%)`;

        barFill.style.width = `${((index + 1) / total) * 100}%`;
    }
    setInterval(rotateSlide, 3000);
}
