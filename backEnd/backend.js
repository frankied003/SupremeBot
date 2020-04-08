const axios = require("axios");
const cheerio = require("cheerio");

var helperFunctions = require("./helperFunctions");


const getSupremeProducts = async () => {

// direct link to the backend of the site
let backendLink = "https://www.supremenewyork.com/mobile_stock.json";

const productsJson = await helperFunctions.redirectTo(
    backendLink, 
    1000, 
    "Successfully connected to backend", 
    "Error accessing Supreme site, retrying...");
    
console.log(productsJson);

}


function addItemToCart(){

        axios.post(
            
        url="https://www.supremenewyork.com/shop/173091/add.json",

        data = {
            "st": 26762,
            "s": 76982,
            "qty": "1"
            }, 

        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Content-Type': 'application/x-www-form-urlencoded'
            },
    
        )
        .then((response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          });

    

}

       
    


getSupremeProducts();

addItemToCart();
