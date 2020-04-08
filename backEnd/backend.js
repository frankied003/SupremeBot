const axios = require("axios");
const cheerio = require("cheerio");

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
        
    console.log(products.data);
}


const addItemToCart = async (itemId, styleId, sizeId) => {

    let postUrl = `https://www.supremenewyork.com/shop/${itemId}/add.json`;
    let postData = {
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
    
    console.log(addToCart.headers["set-cookie"][2]); //this return the pure_cart cookie, need to parse it now
    return(addToCart)


    // axios.post(
        
    // url="https://www.supremenewyork.com/shop/173091/add.json",

<<<<<<< HEAD
    // let postData = {
    //     "st": 26762,
    //     "s": 76982,
    //     "qty": "1"
    //     }, 

    // headers = {
    //     'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //     },

    // )
    // .then((response) => {
    //     console.log(response);
    //     }, (error) => {
    //     console.log(error);
    //     });
=======
function addItemToCart(itemId,styId,size,quantity){

        axios.post(
            
        url="https://www.supremenewyork.com/shop/" + toString(itemId) + "/add.json",

        data = {
            "st": styId,
            "s": size,
            "qty": quantity
            }, 
>>>>>>> d10da7bf0eafaf79825fa47126e06d06eef7248b

}

const checkout = async (pureCartCookie) => {
    // direct link to the backend of the site
    let checkoutLink = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=USA&cookie-sub=${pureCartCookie}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;

    // let checkoutLink = "https://www.supremenewyork.com/mobile/#checkout";

    const checkoutData = await helperFunctions.redirectTo(
        checkoutLink, 
        RETRY_DELAY, 
        "Checking out!", 
        "Error accessing checkout page, retrying...");
        
    console.log(checkoutData.headers);
}

       
async function start () {
    await getSupremeProducts();
    await addItemToCart(173091, 26762, 76982);
    await checkout();
}

<<<<<<< HEAD
start();

// ADD TO CART WORKS, NEED TO FINISH GETTING CHECKOUT PAGE TO LOAD, NEED TO PASS IN THE PURE_CART COOKIE INTO THE CHECKOUTLINK
=======
//getSupremeProducts();

addItemToCart(173901,26762,76982,"1");
>>>>>>> d10da7bf0eafaf79825fa47126e06d06eef7248b
