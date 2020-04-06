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

getSupremeProducts();


