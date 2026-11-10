import moment from "moment";
import { getSingleProductById } from "./product";
import { escapeUrl, renderRatingStars, safeUrl } from "../../../shared/helpers";
import { sanitizeHtml } from "../../../shared/sanitize";

let params = new URLSearchParams(location.search);
const id = params.get('id');

//handle loading
document.body.addEventListener("click" , () => {
    document.querySelector(".overlay-loading").style.display = "none";
});

const productDetailsHandle = () => {

    displayTargetProduct();
    productSmallImagesList(); //handle small images list to fire when clicked
    productSliderImagesList(); //handle slider images
    productTabsHandle(); //handle tabs

}



//get single product and display it
const displayTargetProduct = async() => {
    const product = await getSingleProductById(id);

    //handle edit btn
    // document.querySelector(".details-edit-btn").addEventListener("click" , () => {

    //     location.assign(`/adminpanel/products/update?id=${id}`);

    // });

    let smallImgListItems = "";

    //loop on product of images to create small images (first item gets the active class)
    product.Images.forEach((img , index) => {

        smallImgListItems +=
        `
        <li class="small-image-item${index == 0 ? " active" : ""}">
            <img class="small-img" src="${escapeUrl(img.url)}" alt="small" data-index="${index}">
        </li>
        `

    });

    document.querySelector(".small-images-list").innerHTML = smallImgListItems;
    document.getElementById("previewImage").src = safeUrl(product.Images[0].url);

    //handle product information
    document.querySelector(".product-name").textContent = product.Name;
    document.querySelector(".product-category").textContent = product.Category;

    //handle rating stars...
    document.querySelector(".product-rating").innerHTML = renderRatingStars(product.Rating).html;
    

    //handle status of product
    if(product.Status)
    {
        document.querySelector(".product-status").textContent = "Available";
        document.querySelector(".product-status").style.backgroundColor = "#0fa423";
    }
    else
    {
        document.querySelector(".product-status").textContent = "Deleted";
        document.querySelector(".product-status").style.backgroundColor = "#d72215";
    }

    //handle small Description
    document.querySelector(".product-description").innerHTML = sanitizeHtml(product.Description);

    //handle Price
    document.querySelector(".price-val").textContent = product.Price;

    //handle discount found
    if(product.HasDiscount)
    {
        document.querySelector(".product-discount").textContent = "Discount";
        document.querySelector(".product-discount").style.backgroundColor = "#0fa423";
    }
    else
    {
        document.querySelector(".product-discount").textContent = "No Discount";
        document.querySelector(".product-discount").style.backgroundColor = "#d72215";
    }

    //handle discount value
    if(parseInt(product.DiscountVal) > 0)
    {
        document.querySelector(".product-discount-percentage").textContent = product.DiscountVal + "%";
        document.querySelector(".product-discount-percentage").style.backgroundColor = "#0fa423";
    }
    else
    {
        document.querySelector(".product-discount-percentage").textContent = product.DiscountVal + "%";
        document.querySelector(".product-discount-percentage").style.backgroundColor = "#d72215";
    }

    //handle Quantity value
    document.querySelector(".current-quantity").textContent = product.Quantity;

    //handle no of purchasing value
    document.querySelector(".current-no-purchasing").textContent = product.numberOfPurchasing

    //handle createAt time
    document.querySelector(".current-createdAt-product").textContent = moment(product.CreateAt).format('MMMM Do YYYY, h:mm:ss a');

    //handle last Updated time
    document.querySelector(".lastUpdate-product").textContent = (product.LastUpdatedAt) ? moment(product.LastUpdatedAt).format('MMMM Do YYYY, h:mm:ss a') : "No Updated Yet";
    
    //handle description tab
    document.getElementById("tabProductDescription").innerHTML = sanitizeHtml(product.Description);

}



//handle card footer ==> product tabs (description and others)
const productTabsHandle = () => {


    document.querySelectorAll(".product-description-tab-list > li").forEach((tabItem) => {

        tabItem.addEventListener("click" , function(){ //when click on tab item in list 

            //firstly remove class item from all tab items

            document.querySelectorAll(".product-description-tab-list > li").forEach((tabItem) => {
                tabItem.classList.remove("active");
            });

            //set class active on target tab item 

            this.classList.add("active");

            //second remove class active from all tabs container
            document.querySelectorAll(".product-description-tab .tab-container").forEach((tabContainer) => {

                tabContainer.classList.remove("active");

            });
            
            //set class active on target tab container

            const targetTabContainerId = this.dataset.id;
            
            document.getElementById(targetTabContainerId).classList.add("active");

            
        });


    });



};


//handle product small covers lightBox
const productSmallImagesList = () => {

    document.addEventListener("click" , (event) => {

        if(event.target.classList.contains("small-img")){

            //firstly remove class item from all images
            document.querySelectorAll(".small-images-list .small-image-item .small-img").forEach((item) => {
                item.parentElement.classList.remove("active");
            });

            //set class active on target small image 
            event.target.parentElement.classList.add("active");

            //change src of preview image.
            document.getElementById("previewImage").src = event.target.src;

        }

    });

}

//handle product slider covers lightBox
const productSliderImagesList = () => {

    let targetIndex = ""; //to get target index and store here after click
    let sourceImagesArr = []; //store all src of small images when click on show  

    //get array from small images to get all sources by using foreach
    let smallImages = [];

    //when click open overlay with slider
    document.querySelector(".preview-overlay span").addEventListener("click" , function(){

        smallImages = Array.from(document.querySelectorAll(".small-images-list .small-image-item .small-img"))

        smallImages.forEach((img) => {
            //store all src of images in array to use it in preview after click control buttons
            sourceImagesArr.push(img.src);

        });

        //get target index using filter on active class 
        targetIndex = smallImages.filter((img) => img.parentElement.classList.contains("active"));
        targetIndex = targetIndex[0].dataset.index; //get target index

        //set source of target index in preview image
        document.querySelector(".show-slider-image .center img").src = sourceImagesArr[targetIndex];
        document.querySelector(".show-slider-image").style.display = "flex"; //display slider 

    });

    //handle controll button depend on increase and decrease targetIndex that get src form sourceImageArr.
    document.querySelector(".show-slider-image").addEventListener("click" , function(){
        sourceImagesArr = [];
        this.style.display = "none";

    });

    document.querySelector(".show-slider-image .previous-btn").addEventListener("click" , function(event){
        event.stopPropagation();
        
        if(targetIndex <= 0) 
            targetIndex = sourceImagesArr.length - 1;
        else
            targetIndex--;
        document.querySelector(".show-slider-image .center img").src = sourceImagesArr[targetIndex];

    });

    document.querySelector(".show-slider-image .next-btn").addEventListener("click" , function(event){
        event.stopPropagation();
        
        if(targetIndex >= (sourceImagesArr.length - 1)) 
            targetIndex = 0;
        else
            targetIndex++;
        document.querySelector(".show-slider-image .center img").src = sourceImagesArr[targetIndex];

    });

}




productDetailsHandle();