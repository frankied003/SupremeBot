const axios = require("axios");
const cheerio = require("cheerio");
const lodash = require('lodash')

var helperFunctions = require("./helperFunctions");

const  RETRY_DELAY = 1000;
const ADD_TO_CART_DELAY = 2000;
const CHECKOUT_DELAY = 2500;

const getSupremeProducts = async () => {

    // direct link to the backend of the site
    let backendLink = "https://www.supremenewyork.com/mobile_stock.json";

    const products = await helperFunctions.redirectTo(
        backendLink, 
        RETRY_DELAY, 
        "Successfully connected to backend!", 
        "Error accessing Supreme site, retrying...");
        
    productSearch(products.data)
    return 
}


const productSearch = (products) => {

    var categories = ["Bags", "Accessories", "Skate", "Pants", "Shoes", "Shirts", 'Jackets', "Tops/Sweaters", "Hats", "Sweatshirts", "Jackets", "Shirts"];
    var names_and_keys = [Bags = [{}], Accessories = [{}], Skate = [{}], Pants = [{}], Shoes = [{}], Shirts = [{}], Jackets = [{}], Tops_Sweaters = [{}], Hats = [{}], Sweatshirts = [{}], Jackets = [{}], Shirts = [{}]];
    
    
    for (var i = 0; i< categories.length; i++){
        
        for(var x = 0; x < 30; x++)
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
    console.log(names_and_keys[0])

}
// Need to search for products on the backend site above


const addItemToCart = async (itemId, styleId, sizeId) => {

    const postUrl = `https://www.supremenewyork.com/shop/${itemId}/add.json`;
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
    console.log(addToCart.headers);
    let cartCookie = addToCart.headers["set-cookie"][2];
    cartCookie = cartCookie.split("=")[1].split(";")[0]; // this returns the pure_cart cookie value
    // console.log(cartCookie); 

    return cartCookie;

}

const checkout = async (cookie) => {

    // checkoutPureCartCookie = cookie.split("%").join("%25");
    // console.log(checkoutPureCartCookie);
    
    // const checkoutLink = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=USA&cookie-sub=${checkoutPureCartCookie}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;

    const checkoutLink = "https://www.supremenewyork.com/mobile/#checkout";
    const checkoutEndpoint = "https://www.supremenewyork.com/checkout.json";

    // go to the checkout page
    const checkoutPage = await helperFunctions.redirectTo(
        checkoutLink, 
        RETRY_DELAY, 
        "Checking out!", 
        "Error accessing checkout page, retrying...");
        
    console.log(checkoutPage);

    // post checkoutdata

    const now = new Date()  
    const epochTime = Math.round(now.getTime() / 1000)  
    
    const checkoutData = {
        "store_credit_id": "",
        "from_mobile": "1",
        "cookie-sub": cookie,
        "current_time": epochTime,
        "same_as_billing_address": "1",
        "scerkhaj": "CKCRSUJHXH",
        "order[billing_name]": "",
        "order[bn]": "Frank DiGiacomo",
        "order[email]": "frankied3030@gmail.com",
        "order[tel]": "914-602-6334",
        "order[billing_address]": "123 cool lane",
        "order[billing_address_2]": "",
        "order[billing_zip]": "1234",
        "order[billing_city]": "blahh",
        "order[billing_state]": "NY",
        "order[billing_country]": "USA",
        "store_address": "1",
        "riearmxa": "1234123412341234",
        "credit_card[month]": "05",
        "credit_card[year]": "2027",
        "rand": "",
        "credit_card[meknk]": "123",
        "order[terms]": "0",
        "order[terms]": "1",
        "g-recaptcha-response": "03AHaCkAaqoqmzogniNJqrTxGx0UlmOsavs8hzVQl2eOQghD2ARiTbS26C7ExrZSI6LPaFjwDF-pQ2lh4SuhqQ-UoCmykZllFgHknaqDHXEAweYkDmmsLQ1sNm-bubcC9BhdhPfumoJlhrQo8oUfYXyk6ic0l4ix7B9tpV1lxhyK8kxy-aSqBEhOwDIwltCiMEj1KBkweAA3L88KaQ9jk5AXKfH1tx5SAUem5Z6PtsjSB6lwvNUqorNS7PErqE_kIQI4UKs7tJcJV6N9k6dphAwdzedPEkmA5FfV3pF7vN45scdMXoOKNo4uQXzZ4D3RZ1ux59Ox1VC8rpPXzJ2WK_kb4BSbAmxYkICrpAaHuH9b_FOw7ck0nhHzcpJJhZNUiqYGrCNFEtt6q9eR5CCIZZ56E85MRzikKlGw"
        }

    const completeCheckout = await helperFunctions.postTo(
        checkoutEndpoint,
        checkoutData,
        CHECKOUT_DELAY,
        "Sending payment details",
        "Error sending checkout data"
    );

    console.log(completeCheckout.data);
}

       
async function start () {
    await getSupremeProducts();
    const pureCartCookie = await addItemToCart(173064, 26660, 76664);
    await checkout(pureCartCookie);
}

start();

// ADD TO CART WORKS, NEED TO FINISH GETTING CHECKOUT PAGE TO LOAD, NEED TO PASS IN THE PURE_CART COOKIE INTO THE CHECKOUTLINK
