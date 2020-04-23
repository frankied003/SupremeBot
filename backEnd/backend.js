const lodash = require('lodash');
const fuzzyset = require('fuzzyset.js')
var helperFunctions = require("./helperFunctions");

const  RETRY_DELAY = 1500;
const ADD_TO_CART_DELAY = 2000;
const CHECKOUT_DELAY = 2500;

const getSupremeProducts = async () => {

    let supremeHome = `?p=${new Date().getTime()}`;

    await helperFunctions.redirectTo(
        supremeHome, 
        RETRY_DELAY, 
        "Successfully connected to Supreme!", 
        "Error accessing Supreme site, retrying...");

    // direct link to the backend of the site
    let backendLink = "/mobile_stock.json";

    const products = await helperFunctions.redirectTo(
        backendLink, 
        RETRY_DELAY, 
        "Successfully connected to backend!", 
        "Error accessing Supreme site, retrying...");
        
    productSearch(products.data)
    return 
}


const productSearch = async (products) => {

    var categories = ["Bags", "Accessories", "Skate", "Pants", "Shoes", "Shirts", 'Jackets', "Tops/Sweaters", "Hats", "Sweatshirts", "Jackets", "Shirts"];
    var names_and_keys = [Bags = [{}], Accessories = [{}], Skate = [{}], Pants = [{}], Shoes = [{}], Shirts = [{}], Jackets = [{}], Tops_Sweaters = [{}], Hats = [{}], Sweatshirts = [{}], Jackets = [{}], Shirts = [{}]];
    
    //Inserts item name and id into associated category dictionary
    for (var i = 0; i< categories.length; i++){
        
        for(var x = 0; x < 50; x++)
        {
            if(categories[i] == lodash.get(products, `products_and_categories.${categories[i]}[${x}].category_name`))
            {
                names_and_keys[i].push({
                    key: lodash.get(products, `products_and_categories.${categories[i]}[${x}].name`),
                    value: lodash.get(products, `products_and_categories.${categories[i]}[${x}].id`)
                })
            }  
        }
           
    }

    //Prints out dictionary of items in category. Ex. names_and_keys[0] prints out the bags dictionary which has all the bags in it with the ids.
    var category = 5;
    // console.log(names_and_keys[category]);

    //We want an array of just the names of the products in the category, ie "Backpack", "Shoulder Bag" in Bags category
    var just_names = [];
    for(var x = 0; x <names_and_keys[category].length; x++){
    just_names[x] = Object.values(names_and_keys[category][x])[0];
    }

    //First array value is empty
    just_names.shift();

    fs = FuzzySet(
    just_names, false)

    //Item most similar to keywords - dictionary form with how close keyword is too actual product name
    var foundItem = fs.get('plaid shirt');
    //console.log(foundItem)

    //If keywords are not accurate enough
    if(foundItem === null){
        console.log("Error try new key words");
        return false;}

    //Item most similar to keywords - just name of item
    var item = foundItem[0][1];
        console.log(item);

    // Search for item code 
    for(var x = 0; x <names_and_keys[category].length; x++){
        if(item === names_and_keys[category][x].key){
           var desired_item_id = names_and_keys[category][x].value;
           break;
        }
    }
    //Desired Item Id - Done
    console.log(desired_item_id);

    const itemLink = `/shop/173099.json`;

    const itemPage = await helperFunctions.redirectTo(
        itemLink, 
        RETRY_DELAY, 
        "Successfully connected to product page!", 
        "Error accessing Supreme site, retrying...");

    // console.log(itemPage.data);  // this is for the product page parsing for sizes and colors
}

const addItemToCart = async (itemId, styleId, sizeId) => {

    const postUrl = `/shop/${itemId}/add.json`;
    const postData = {
        "st": styleId,
        "s": sizeId,
        "qty": "1"
    };

    const addToCart = await helperFunctions.postTo(
        postUrl, 
        postData, 
        ADD_TO_CART_DELAY,
        "Successfully added item to cart, going to checkout!",
        "Failed to add item to cart, retrying...");
    
    let allCookies = addToCart.headers["set-cookie"].join("; ");
        
    let pureCookie = addToCart.headers["set-cookie"][2];
    pureCookie = pureCookie.split("=")[1].split(";")[0]; // this returns the pure_cart cookie value
    
    let ticketCookie = addToCart.headers["set-cookie"][4]; // return the ticket cookie if there is one
    ticketCookie = ticketCookie.split(";")[0];

    let cartCookie = addToCart.headers["set-cookie"][1]; // return the ticket cookie if there is one
    cartCookie = cartCookie.split(";")[0];
    
    return [allCookies, pureCookie, ticketCookie, cartCookie];

}

const checkout = async (cookie, addToCartCookies, ticketCookie, cartCookie) => {

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
            'accept': 'text/html',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/x-www-form-urlencoded',
            'referer': 'https://www.supremenewyork.com/mobile',
            'cookie': firstCookies,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'x-requested-with': 'XMLHttpRequest',
            'Connection': 'keep-alive'
        }, 
        RETRY_DELAY, 
        "Sending payment details soon...", 
        "Error accessing checkout page, retrying...");

    let checkoutPageCookies = checkoutPage.headers["set-cookie"].join(";");

    let checkoutCookies = `${checkoutPageCookies}; lastVisitedFragment=checkout; pure_cart=${cookie}; ${cartCookie};`;
    console.log("\n" + checkoutCookies);
    
    // checkout data
    const checkoutData = {
        "store_credit_id": "",
        "from_mobile": "1",
        "cookie-sub": cookie,
        "current_time": `${epochTime}`,
        "same_as_billing_address": "1",
        "scerkhaj": "CKCRSUJHXH",
        "order[billing_name]": "",
        "order[bn]": "Testing Cool",
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
            'cookies': checkoutCookies
        },
        CHECKOUT_DELAY,
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

    while(!statusComplete) {

        const status = await helperFunctions.redirectTo(
            checkoutStatusLink, 
            500, 
            "Checking status of payment", 
            "Failed to check status of payment");
        
        console.log(status.data);

        if (status.data.status == "queued"){
            console.log("Checking status, please wait");
        }
        else if(status.data.status == "failed") {
            console.log("Payment failed or declined");
            statusComplete = true;
        }
        else if(status.data.status == "paid") {
            console.log("Payment completed, check your bank for charge or email!");
            statusComplete = true;
        }
        else {
            console.log("Checkout failed");
            statusComplete = true;
        }
    }
}

       
async function start () {
    await getSupremeProducts();
    const cartCookies = await addItemToCart(172991, 26366, 75667);
    const checkoutToken = await checkout(cartCookies[1], cartCookies[0], cartCookies[2], cartCookies[3]);
    await checkoutStatus(checkoutToken);
}

start();
