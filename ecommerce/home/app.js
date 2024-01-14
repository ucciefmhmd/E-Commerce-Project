
/* home slider */
const myslide = document.querySelectorAll('.myslide');
const dot = document.querySelectorAll('.dot');
let counter = 1;
slidefun(counter);

let timer = setInterval(autoSlide, 7000);
function autoSlide() {
    counter += 1;
    slidefun(counter);
}
function plusSlides(n) {
    counter += n;
    slidefun(counter);
    resetTimer();
}
function currentSlide(n) {
    counter = n;
    slidefun(counter);
    resetTimer();
}
function resetTimer() {
    clearInterval(timer);
    timer = setInterval(autoSlide, 7000);
}

function slidefun(n) {
    for (let i = 0; i < myslide.length; i++) {
        myslide[i].style.display = "none";
    }
    for (let i = 0; i < dot.length; i++) {
        dot[i].className = dot[i].className.replace(' active', '');
    }
    if (n > myslide.length) {
        counter = 1;
    }
    if (n < 1) {
        counter = myslide.length;
    }
    myslide[counter - 1].style.display = "block";
    dot[counter - 1].className += " active";
}


document.querySelector(".prev").addEventListener("click", () => { plusSlides(-1) });
document.querySelector(".next").addEventListener("click", () => { plusSlides(1) });

document.querySelector(".dotsbox .dot:nth-of-type(1)").addEventListener("click", () => { currentSlide(1) });
document.querySelector(".dotsbox .dot:nth-of-type(2)").addEventListener("click", () => { currentSlide(2) });
document.querySelector(".dotsbox .dot:nth-of-type(3)").addEventListener("click", () => { currentSlide(3) });




//  best Seller Slider

const carouselSeller = document.querySelector("#carouselSeller");
const firstCardWidthSeller = carouselSeller.querySelector(".card").offsetWidth;
const arrowBtnsSeller = document.querySelectorAll("#wrapperSeller i");
const carouselSellerChildrens = [...carouselSeller.children];

// No. Cards fits the view
let cardPerViewSeller = Math.round(carouselSeller.offsetWidth / firstCardWidthSeller);

// infinite scrolling by adding the last view card in the first
carouselSellerChildrens.slice(-cardPerViewSeller).reverse().forEach(card => {
    carouselSeller.insertAdjacentHTML("afterbegin", card.outerHTML);
});

// infinite scrolling by adding the last view card in the end
carouselSellerChildrens.slice(0, cardPerViewSeller).forEach(card => {
    carouselSeller.insertAdjacentHTML("beforeend", card.outerHTML);
});


// event to move the slider right & left
arrowBtnsSeller.forEach(btn => {
    btn.addEventListener("click", () => {
        carouselSeller.scrollLeft += btn.id == "left-seller" ? -firstCardWidthSeller : firstCardWidthSeller;
    });
});



// Category Slider -----------------------------------------------------------------------------------------

const carouselCategory = document.querySelector(".carousel2");
const firstCardWidthCategory = carouselCategory.querySelector(".cardCategory").offsetWidth;
const arrowBtnsCategory = document.querySelectorAll(".wrapper2 i");
const carouselCategoryChildrens = [...carouselCategory.children];

// No. Cards fits the view
let cardPerView2 = Math.round(carouselCategory.offsetWidth / firstCardWidthCategory);

// infinite scrolling by adding the last view card in the first
carouselCategoryChildrens.slice(-cardPerView2).reverse().forEach(card => {
    carouselCategory.insertAdjacentHTML("afterbegin", card.outerHTML);
});

// infinite scrolling by adding the last view card in the end
carouselCategoryChildrens.slice(0, cardPerView2).forEach(card => {
    carouselCategory.insertAdjacentHTML("beforeend", card.outerHTML);
});


// event to move the slider right & left
arrowBtnsCategory.forEach(btn => {
    btn.addEventListener("click", () => {
        carouselCategory.scrollLeft += btn.id == "category-left" ? -firstCardWidthCategory : firstCardWidthCategory;
    });
});





// -------------------------------------------------------------------------------



const carousel = document.querySelector(".carousel");
const firstCardWidth = carousel.querySelector(".card").offsetWidth;
const arrowBtns = document.querySelectorAll(".wrapper i");
const carouselChildrens = [...carousel.children];


// No. Cards fits the view
let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

// infinite scrolling by adding the last view card in the first
carouselChildrens.slice(-cardPerView).reverse().forEach(card => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
});

// infinite scrolling by adding the last view card in the end
carouselChildrens.slice(0, cardPerView).forEach(card => {
    carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

// event to move the slider right & left
arrowBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        carousel.scrollLeft += btn.id == "all-left" ? -firstCardWidth : firstCardWidth;
    });
});



