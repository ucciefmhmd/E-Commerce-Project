//handle badges counter
const checkBadgesCounter = () => {

    if(localStorage.getItem("shoppingCart")){
        let shoppingCartArrayCounter = [];

        shoppingCartArrayCounter = JSON.parse(localStorage.getItem("shoppingCart"));

        document.getElementById("cartBagBadge").innerHTML = shoppingCartArrayCounter.length;


    }

    if(localStorage.getItem("wishlistCart")){

        let wishlistCartArrayCounter = [];

        wishlistCartArrayCounter = JSON.parse(localStorage.getItem("wishlistCart"));
        
        document.getElementById("favBadge").innerHTML = wishlistCartArrayCounter.length;


    }

}

checkBadgesCounter();