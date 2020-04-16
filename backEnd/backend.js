const lodash = require('lodash');
const {Harvester} = require('captcha-manager');

var helperFunctions = require("./helperFunctions");

const  RETRY_DELAY = 1000;
const ADD_TO_CART_DELAY = 2000;
const CHECKOUT_DELAY = 2500;

// for captcha
const harvester = new Harvester();
const siteKey = '6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz';

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
        
    let cartCookie = addToCart.headers["set-cookie"][2];
    cartCookie = cartCookie.split("=")[1].split(";")[0]; // this returns the pure_cart cookie value
    return cartCookie;

}

const harvest = async () => {
    return await harvester.getResponse("supremenewyork.com", siteKey);
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

    // get captcha token
    const captchaToken = await harvest();
    console.log("Captcha Token: " + captchaToken);
    console.log("Pure_Cart Cookie: " + cookie);

    const now = new Date()  
    const epochTime = Math.round(now.getTime() / 1000)  
    
    // checkout data
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
        "order[billing_zip]": "10512",
        "order[billing_city]": "Carmel",
        "order[billing_state]": "NY",
        "order[billing_country]": "USA",
        "store_address": "1",
        "riearmxa": "5108050152568833",
        "credit_card[month]": "05",
        "credit_card[year]": "2027",
        "rand": "",
        "credit_card[meknk]": "123",
        "order[terms]": "0",
        "order[terms]": "1",
        "g-recaptcha-response": captchaToken
        }

    const completeCheckout = await helperFunctions.postTo(
        checkoutEndpoint,
        checkoutData,
        CHECKOUT_DELAY,
        "Sending payment details",
        "Error sending checkout data"
    );

    console.log(completeCheckout.data);

    const slug = completeCheckout.data.slug;
    return slug;
}

const checkoutStatus = async (slug) => {
    const checkoutStatusLink = `https://www.supremenewyork.com/checkout/${slug}/status.json`;
    let statusComplete = false;

    while(!statusComplete) {
        const status = await helperFunctions.redirectTo(checkoutStatusLink, 500, "Checking status of payment", "Failed to check status of payment");

        if (status.data.status != "queued"){
            console.log("Checking status, please wait")
        }
        else if(status.data.status == "failed") {
            console.log("Payment failed or declined");
            statusComplete = true;
        }
        else {
            console.log("Checkout complete, check your card or email");
            statusComplete = true;
        }
    }
}

       
async function start () {
    await getSupremeProducts();
    const pureCartCookie = await addItemToCart(173064, 26660, 76664);
    const checkoutToken = await checkout(pureCartCookie);
    await checkoutStatus(checkoutToken);
}

start();

// ADD TO CART WORKS, NEED TO FINISH GETTING CHECKOUT PAGE TO LOAD, NEED TO PASS IN THE PURE_CART COOKIE INTO THE CHECKOUTLINK
