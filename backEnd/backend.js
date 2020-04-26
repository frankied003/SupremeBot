var productSearch = require('./productSearch');
var helperFunctions = require('./helperFunctions');

const  DELAY = 1500;

const addItemToCart = async (itemId, sizeId, styleId) => {

    const postUrl = `/shop/${itemId}/add.json`;
    const postData = {
        "st": styleId,
        "s": sizeId,
        "qty": "1"
    };

    while(true){

        const addToCart = await helperFunctions.postTo(
            postUrl, 
            postData,
            DELAY,
            "Adding item to cart...",
            "Failed to add item to cart, retrying...");
    
        if(addToCart.data.length > 0){
            let allCookies = addToCart.headers["set-cookie"].join("; ");
                
            let pureCookie = addToCart.headers["set-cookie"][2];
            pureCookie = pureCookie.split("=")[1].split(";")[0]; // this returns the pure_cart cookie value
            
            // let ticketCookie = addToCart.headers["set-cookie"][4]; // return the ticket cookie if there is one
            // ticketCookie = ticketCookie.split(";")[0];
        
            // let cartCookie = addToCart.headers["set-cookie"][1]; // return the ticket cookie if there is one
            // cartCookie = cartCookie.split(";")[0];
            
            return [allCookies, pureCookie];
        }
        else {
            console.log("Item is out of stock, retrying...")
        }
    }
}

const checkout = async (cookie, addToCartCookies) => {

    checkoutPureCartCookie = cookie.split("%").join("%25");
    // console.log(checkoutPureCartCookie);
    const checkoutLink = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=USA&cookie-sub=${checkoutPureCartCookie}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;

    // const checkoutLink = "/mobile/#checkout";
    const checkoutEndpoint = "/checkout.json";

    let now = new Date();
    let epochTime = now.getTime();

    firstCookies = `shoppingSessionId=${epochTime}; ` + addToCartCookies;

    // go to the checkout page
    const checkoutPage = await helperFunctions.redirectToWithHeaders(
        checkoutLink,
        {
            'cookie': firstCookies,
        }, 
        DELAY, 
        "Sending payment details soon...", 
        "Error accessing checkout page, retrying...");

    let checkoutPageCookies = checkoutPage.headers["set-cookie"].join(";");
    
    // checkout data
    const checkoutData = {
        "store_credit_id": "",
        "from_mobile": "1",
        "cookie-sub": cookie,
        "current_time": `${epochTime}`,
        "same_as_billing_address": "1",
        "scerkhaj": "CKCRSUJHXH",
        "order[billing_name]": "",
        "order[bn]": "Jason Pastuzyn",
        "order[email]": "frankied1241242424@gmail.com",
        "order[tel]": "123-123-1234",
        "order[billing_address]": "1242141",
        "order[billing_address_2]": "",
        "order[billing_zip]": "10512",
        "order[billing_city]": "Carmel",
        "order[billing_state]": "NY",
        "order[billing_country]": "USA",
        "riearmxa": "123412314123124",
        "credit_card[month]": "12",
        "credit_card[year]": "1234",
        "rand": "",
        "credit_card[meknk]": "224",
        "order[terms]": "0",
        "order[terms]": "1",
        "g-recaptcha-response": '03AGdBq26_idUNfE_bzF2mHWFHsAD7vQyjZmwoX16MJPbzx-CrXxaImv8ZuJ6Tb7eFS31d9_I0P2OvcI9e0qNA4notHb1VG1u2Ee2PlUBbwsoh0_Zlrfzu5kRs7Ai9P51XxM0oee-3VbSAQ4qIWVV19TiOETm5GmFBmfF-jQqhroU_BIvX5kdiqnCugdUA_KLXlbRoQ5gfXnhWnrqWJs7EsN5VnH6S3QvWzxy2ex0pLHkvbfc1H7jyo9EkMnjHkXIWWXlxnyuyu2Ywtz6_M0NnqVyHD1mYF0cDxCyBT0pCS1jF6DkcI_TqleCQ5qxJ1znwr9eNSXDYbrEBtExiKdd-2zVCvJbM6kmCjQBwJIG1NCeL0skUb_q5X2fYfiqMjSjRPJRL3Zsxv9HfNtiLb09vffSWkWms5JEmsji-dJ8bOfgW_ozWd3QvoUkCjczVY2cHkqagtoYmMK0f-rswxgnERS8CDLizmK2Huw' 
        }

    const completeCheckout = await helperFunctions.postToWithHeaders(
        checkoutEndpoint,
        checkoutData,
        {
            'cookie': checkoutPageCookies
        },
        DELAY,
        "Sent payment details",
        "Error sending checkout data"
    );

    const slug = completeCheckout.data.slug;
    return slug;
}

const checkoutStatus = async (slug) => {

    if (slug == null){
        console.log("Checkout failed, no cookies");
        return false
    }

    const checkoutStatusLink = `/checkout/${slug}/status.json`;
    let statusComplete = false;

    console.log("Checking status, please wait (slug token: " + slug + ")");

    while(!statusComplete) {

        const status = await helperFunctions.redirectTo(
            checkoutStatusLink, 
            500, 
            null, 
            "Failed to check status of payment");

        if(status.data.status == "failed") {
            console.log("Payment failed or declined");
            statusComplete = true;
        }
        else if(status.data.status == "paid") {
            console.log("Payment completed, check your bank for charge or email!");
            statusComplete = true;
        }
    }
}

       
async function start () {
    let itemFound = false;
    let productFoundInfo;

    // if item is not found rerun
    while(!itemFound){
        const allProducts = await productSearch.getSupremeProducts();
        productFoundInfo = await productSearch.productSearch(allProducts, 1, "beaded", "White", "N/A", true);
        if(productFoundInfo !== null){
            itemFound = true;
        }
    }

    const cartCookies = await addItemToCart(productFoundInfo.itemId, productFoundInfo.sizeId, productFoundInfo.styleId);
    const checkoutToken = await checkout(cartCookies[1], cartCookies[0]);
    await checkoutStatus(checkoutToken);
}

start();
