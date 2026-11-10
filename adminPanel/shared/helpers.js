// Pure helpers shared by the storefront and the admin panel.
// No Firebase or DOM imports here, so they can be unit-tested (see tests/).


//---------------------------------------------------------------- HTML output

const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "`": "&#96;",
};

//escape a value before interpolating it into an innerHTML template
//(element content or a quoted attribute value)
export const escapeHtml = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"'`]/g, (char) => HTML_ESCAPES[char]);
};

const SAFE_URL_SCHEMES = ["http", "https", "blob"];

//return url if it is relative or uses http(s)/blob (or is a data: image), otherwise fallback.
//Blocks javascript:, vbscript:, data:text/html and similar in src/href values.
export const safeUrl = (url, fallback = "") => {
    if (url === null || url === undefined) return fallback;

    const value = String(url).trim();
    if (!value) return fallback;

    //browsers ignore tabs/newlines/control chars inside the scheme ("java\tscript:")
    const compact = value.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
    const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/);

    if (!scheme) return value; //relative URL ("/images/a.png", "a.png", "?id=1")
    if (SAFE_URL_SCHEMES.includes(scheme[1])) return value;
    if (compact.startsWith("data:image/")) return value;

    return fallback;
};

//safeUrl + escapeHtml, for URLs interpolated into a quoted attribute in a template
export const escapeUrl = (url, fallback = "") => escapeHtml(safeUrl(url, fallback));


//---------------------------------------------------------------- prices

//price after a percentage discount (discount is parsed as an integer percent)
export const getPriceAfterDiscount = (productPrice , disValue) => {
    const discountValue = parseInt(disValue);
    return productPrice - ((discountValue / 100) * productPrice);
};

//unit price of a cart item, with its discount applied when it has one
export const getUnitPrice = (product) => {
    return product.HasDiscount ? getPriceAfterDiscount(product.Price , product.DiscountVal) : product.Price;
};

//sum of quantityOrder x unit price for every cart item (same integer rounding the cart page always used)
export const getCartTotal = (items) => {
    return items.reduce((total , product) => {
        return total + (parseInt(product.quantityOrder) * parseInt(getUnitPrice(product)));
    } , 0);
};


//---------------------------------------------------------------- rating

//Products store `Rating` as a running total (every review adds 1-5 and every
//confirmed order adds 1), not an average. The UI maps that total to stars with
//50 points per star, capped at 5 stars. See README "Known limitations".
export function calculateRating(value){
    if(!isNaN(parseInt(value))){ //if number
        let ratingValue = parseInt(value);
        if(ratingValue > 250)
        {
            ratingValue = 250;
        }

        let numberOfFillStars = (ratingValue / 50);
        let numberOfFillStarsFloor = Math.floor(numberOfFillStars);

        return {numberOfFillStarsFloor , numberOfFillStars};

    }
    else
    {
        return {numberOfFillStarsFloor:0 , numberOfFillStars:0};
    }
}

//5 star <img> tags for a stored Rating value, plus the numeric value shown next to them
export const renderRatingStars = (rating) => {
    const { numberOfFillStarsFloor , numberOfFillStars } = calculateRating(rating);

    let html = "";
    for (let index = 0; index < 5; index++) {
        html += index < numberOfFillStarsFloor
            ? `<img src="/images/Filled_star.png" class="raiting" alt="raiting">`
            : `<img src="/images/empty_star.png" class="raiting" alt="raiting">`;
    }

    return { html , value: numberOfFillStars };
};
