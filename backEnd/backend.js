const lodash = require('lodash');
const fuzzyset = require('fuzzyset.js');
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
        
    return products.data;
}


const productSearch = async (products, category, item_name, color, size) => {

    var categories = ["Bags", "Accessories", "Skate", "Pants", "Shoes", "Shirts", 'Jackets', "Tops/Sweaters", "Hats", "Sweatshirts", "T-Shirts"];
    var names_and_keys = [Bags = [{}], Accessories = [{}], Skate = [{}], Pants = [{}], Shoes = [{}], Shirts = [{}], Jackets = [{}], Tops_Sweaters = [{}], Hats = [{}], Sweatshirts = [{}], TShirts = [{}]];
    
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
    // console.log(names_and_keys[category]);

    //We want an array of just the names of the products in the category, ie "Backpack", "Shoulder Bag" in Bags category
    var just_names = [];
    for(var x = 0; x <names_and_keys[category].length; x++){
    just_names[x] = Object.values(names_and_keys[category][x])[0];
    }

    //First array value is empty
    just_names.shift();
    fs = FuzzySet(just_names, false);
    var foundItem = fs.get(item_name);


    if(foundItem === null){
        console.log("Error try new key words");
        return false}


    //Item most similar to keywords - just name of item
    var foundItem_name = foundItem[0][1];
        console.log("Found item: " + foundItem_name);

        console.log(names_and_keys[category]);
    // Search for item code 
    for(var x = 0; x <names_and_keys[category].length; x++){
        if(foundItem_name === names_and_keys[category][x].key){
           var desired_item_id = names_and_keys[category][x].value;
           break;
        }
    }
    
    //For getting colorId and sizeId
    const itemLink = `/shop/${desired_item_id}.json`;

    const itemPage = await helperFunctions.redirectTo(
        itemLink, 
        RETRY_DELAY, 
        "Successfully connected to product page!", 
        "Error accessing Supreme site, retrying...");

    //console.log(itemPage.data);  this is for the product page parsing for sizes and colors


    for(var product = 0; product < Object.keys(itemPage.data.styles).length; product++){
        if(color === lodash.get(itemPage.data, `styles[${product}].name`)){
            var colorId = lodash.get(itemPage.data, `styles[${product}].id`);

            for(var product_size = 0; product_size < 4; product_size++){
                if(size === lodash.get(itemPage.data, `styles[${product}].sizes[${product_size}].name`)){
                    var sizeId = lodash.get(itemPage.data, `styles[${product}].sizes[${product_size}].id`);
                }
            }
        }
    }

    if(colorId === null || sizeId == null){
        console.log("Wrong color or size inputed")
        return false
    }

    //Desired Item Id - Done
    console.log(desired_item_id);
    //Color ID - Done 
    console.log(colorId);
    //Size ID - Done
    console.log(sizeId);

    const itemDetails = {
        'itemId': desired_item_id,
        'styleId': colorId,
        sizeId
    };

    return itemDetails;
}

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
            ADD_TO_CART_DELAY,
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
        RETRY_DELAY, 
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
    const allProducts = await getSupremeProducts();
    const productFoundInfo = await productSearch(allProducts, 1, "socks", "Red", "N/A");
    const cartCookies = await addItemToCart(productFoundInfo.itemId, productFoundInfo.sizeId, productFoundInfo.styleId);
    const checkoutToken = await checkout(cartCookies[1], cartCookies[0]);
    await checkoutStatus(checkoutToken);
}

start();
