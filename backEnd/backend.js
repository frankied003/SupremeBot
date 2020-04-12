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
    
    // const checkoutLink = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=USA&cookie-sub=${cookie}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;

    const checkoutLink = "https://www.supremenewyork.com/mobile/#checkout";

    const checkoutData = await helperFunctions.redirectTo(
        checkoutLink, 
        RETRY_DELAY, 
        "Checking out!", 
        "Error accessing checkout page, retrying...");
        
    console.log(checkoutData);
}

       
async function start () {
    await getSupremeProducts();
    const pureCartCookie = await addItemToCart(173064, 26660, 76664);
    await checkout(pureCartCookie);
}

start();

// ADD TO CART WORKS, NEED TO FINISH GETTING CHECKOUT PAGE TO LOAD, NEED TO PASS IN THE PURE_CART COOKIE INTO THE CHECKOUTLINK
