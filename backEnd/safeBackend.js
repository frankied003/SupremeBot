const puppeteer = require('puppeteer');
var helperFunctions = require("./helperFunctions");
const lodash = require('lodash');
const fuzzyset = require('fuzzyset.js');

const  RETRY_DELAY = 1500;

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

(async () => {
  const allProducts = await getSupremeProducts();
  const productFoundInfo = await productSearch(allProducts, 1, "socks", "Red", "N/A");

  const itemId = productFoundInfo.itemId;
  const styleId = productFoundInfo.styleId;

  const browser = await puppeteer.launch({ 
      headless: false,
   });

  const page = await browser.newPage();

  // set user agent
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
  await page.setViewport({ width: 375, height: 812 });

  // Instructs the blank page to navigate a URL
  console.log("Opening safe browser");
  await page.goto(`https://www.supremenewyork.com/mobile#products/${itemId}/${styleId}`);

  await page.waitForSelector('.cart-button');

  const isElementVisible = async (page, selector) => {
    let visible = true;
    await page
      .waitForSelector(selector, { visible: true, timeout: 50 })
      .catch(() => {
        visible = false;
      });
    return visible;
  };

  let checkoutButtonVisible = await isElementVisible(page, '#checkout-now');
  while (!checkoutButtonVisible) {
    await page.click('#cart-update > span');
    checkoutButtonVisible = await isElementVisible(page, '#checkout-now');
  }

  // click checkout now
  await page.click('#checkout-now');
  console.log("Added to cart, going to checkout...");

  // waits for form to load
  let checkoutFormVisible = await isElementVisible(page, '#order_bn');
  while (!checkoutFormVisible) {
    checkoutFormVisible = await isElementVisible(page, '#order_bn');
  }

  console.log("Checkout loaded, filling payment...");

  
  // filling in billing
  await page.$eval('#order_bn', el => el.value = `Frank DiGiacomo`);
  await page.$eval('#order_email', el => el.value = `blahblah12312313@gmail.com`);
  await page.$eval('#order_tel', el => el.value = `914-123-1234`);
  await page.$eval('#order_billing_address', el => el.value = `123 Bobby lane`);
  await page.$eval('#order_billing_address_2', el => el.value = ``);
  await page.$eval('#obz', el => el.value = `12345`);
  await page.$eval('#order_billing_city', el => el.value = `blah`);
  await page.select('#order_billing_state', `NY`);
  await page.select('#order_billing_country', 'USA');
  await page.$eval('#cnid', el => el.value = `1234123412341234`);
  await page.select('#credit_card_month', `04`);
  await page.select('#credit_card_year', `2025`);
  await page.$eval('#vvv-container > input[type=tel]', el => el.value = `123`);
  await page.click("#order_terms");
  await page.$eval('#g-recaptcha-response', el => el.value = `ff432r32x3rcc4r3r243rc4r43r234r`);
  // await page.click("#submit_button");

  // var data = await page._client.send('Network.getAllCookies');
  // console.log(data);

  // waits for payment to go through

  let checkoutProcessingVisible = await isElementVisible(page, '#checkout-loading-message');
  console.log("Payment processing, please wait...")
  while (checkoutProcessingVisible) {
    checkoutProcessingVisible = await isElementVisible(page, '#checkout-loading-message');
  }

  const paymentFailed = await isElementVisible(page, '#charge-error');

  if(paymentFailed){
    console.log("Payment declined");
  }
  else{
    console.log("Payment successful, check your email");
  }

  await browser.close();
})();