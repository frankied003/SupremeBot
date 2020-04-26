// this file runs for both safe and fast mode because no ticket is generated during this process

const lodash = require('lodash');
const fuzzyset = require('fuzzyset.js');
var helperFunctions = require("./helperFunctions");

const DELAY = 1500;

const getSupremeProducts = async () => {

    let supremeHome = `?p=${new Date().getTime()}`;

    await helperFunctions.redirectTo(
        supremeHome, 
        DELAY, 
        "Successfully connected to Supreme!", 
        "Error accessing Supreme site, retrying...");

    // direct link to the backend of the site
    let backendLink = "/mobile_stock.json";

    const products = await helperFunctions.redirectTo(
        backendLink, 
        DELAY, 
        "Successfully connected to backend!", 
        "Error accessing Supreme site, retrying...");
        
    return products.data;
}


const productSearch = async (products, category, item_name, color, size, firstItem) => {

    var categories = ["Bags", "Accessories", "Skate", "Pants", "Shoes", "Shirts", 'Jackets', "Tops/Sweaters", "Hats", "Sweatshirts", "T-Shirts"];
    var names_and_keys = [Bags = [{}], Accessories = [{}], Skate = [{}], Pants = [{}], Shoes = [{}], Shirts = [{}], Jackets = [{}], Tops_Sweaters = [{}], Hats = [{}], Sweatshirts = [{}], TShirts = [{}]];
    
    //Inserts item name and id into associated category dictionary
    for (var i = 0; i< categories.length; i++){
        
        for(var x = 0; x < Object.keys(products.products_and_categories).length; x++) //changed limit from 50 runtime should be better
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
        console.log('No item found, retrying...')
        return null;
    }

    //Item most similar to keywords - just name of item
    var foundItem_name = foundItem[0][1];
        console.log("Found item: " + foundItem_name);

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
        DELAY, 
        "Successfully connected to product page!", 
        "Error accessing Supreme site, retrying...");

    //console.log(itemPage.data);  this is for the product page parsing for sizes and colors

    //For finding first colorway and size
    if (firstItem) {
        
        //First Colorway
        var colorId = lodash.get(itemPage.data, `styles[0].id`);
        console.log(colorId);
        //First Size
        var sizeId = lodash.get(itemPage.data, `styles[0].sizes[0].id`)
        console.log(sizeId);

        const itemDetails = {
            'itemId': desired_item_id,
            'styleId': colorId,
            sizeId
        };
    
        return itemDetails;
    }
        

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
        throw new Error("No size or color found, retrying...");
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

module.exports = {
    getSupremeProducts: getSupremeProducts,
    productSearch: productSearch
}