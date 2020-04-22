const lodash = require('lodash');
const fuzzyset = require('fuzzyset.js')
var helperFunctions = require("./helperFunctions");

const  RETRY_DELAY = 1000;
const ADD_TO_CART_DELAY = 2000;
const CHECKOUT_DELAY = 2500;

const getSupremeProducts = async () => {

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


const productSearch = (products) => {

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
    console.log(names_and_keys[category]);

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
}
// Need to search for products on the backend site above


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
    
    let cookies = addToCart.headers["set-cookie"].join(";");
        
    let cartCookie = addToCart.headers["set-cookie"][2];
    cartCookie = cartCookie.split("=")[1].split(";")[0]; // this returns the pure_cart cookie value
    return [cookies, cartCookie];

}

const checkout = async (cookie) => {

    // checkoutPureCartCookie = cookie.split("%").join("%25");
    // console.log(checkoutPureCartCookie);
    // const checkoutLink = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=USA&cookie-sub=${checkoutPureCartCookie}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;

    const checkoutLink = "/mobile/#checkout";
    const checkoutEndpoint = "/checkout.json";

    // go to the checkout page
    const checkoutPage = await helperFunctions.redirectTo(
        checkoutLink, 
        RETRY_DELAY, 
        "Checking out!", 
        "Error accessing checkout page, retrying...");

    console.log("Pure_Cart Cookie: " + cookie);
    console.log(checkoutPage);

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
        "order[bn]": "testing bobby",
        "order[email]": "frank334234134324@gmail.com",
        "order[tel]": "123-123-1234",
        "order[billing_address]": "123 cool lane",
        "order[billing_address_2]": "",
        "order[billing_zip]": "12345",
        "order[billing_city]": "hello",
        "order[billing_state]": "NY",
        "order[billing_country]": "USA",
        "store_address": "1",
        "riearmxa": "1234123412341235",
        "credit_card[month]": "05",
        "credit_card[year]": "2027",
        "rand": "",
        "credit_card[meknk]": "123",
        "order[terms]": "0",
        "order[terms]": "1",
        "g-recaptcha-response": 'captchaToken' 
        }

    const completeCheckout = await helperFunctions.postTo(
        checkoutEndpoint,
        checkoutData,
        CHECKOUT_DELAY,
        "Sending payment details",
        "Error sending checkout data"
    );

    console.log(completeCheckout);

    const slug = completeCheckout.data.slug;
    return slug;
}

const checkoutStatus = async (slug) => {
    const checkoutStatusLink = `/checkout/${slug}/status.json`;
    let statusComplete = false;

    while(!statusComplete) {
        const status = await helperFunctions.redirectTo(
            checkoutStatusLink, 
            500, 
            "Checking status of payment", 
            "Failed to check status of payment");

        if (status.data.status != "queued"){
            console.log("Checking status, please wait")
        }
        else if(status.data.status == "failed") {
            console.log("Payment failed or declined");
            statusComplete = true;
        }
        else if(status.data.status == "success") {
            console.log("Payment completed, check your bank for charge or email!");
            statusComplete = true;
        }
        else {
            console.log("Checkout failed, no cookies");
            statusComplete = true;
        }
    }
}

       
async function start () {
    await getSupremeProducts();
    const cartCookies = await addItemToCart(173064, 26660, 76664);
    const checkoutToken = await checkout(cartCookies[1]);
    await checkoutStatus(checkoutToken);
}

start();
