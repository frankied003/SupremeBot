const puppeteer = require('puppeteer');
var productSearch = require('./productSearch');

const DELAY = 1500;

// helper functions
const isElementVisible = async (page, selector) => {
  let visible = true;
  await page
    .waitForSelector(selector, { visible: true, timeout: 50 })
    .catch(() => {
      visible = false;
    });
  return visible;
};

const wait = async (delay) => {
  await new Promise(function(resolve) {setTimeout(resolve, delay)});
}


// supreme botting functions
const generateSupremeBrowser = async (page) => {

  let itemFound = false;
    let productFoundInfo;
    while(!itemFound){
        const allProducts = await productSearch.getSupremeProducts();
        productFoundInfo = await productSearch.productSearch(allProducts, 1, "beaded", "White", "N/A", true);
        if(productFoundInfo !== null){
            itemFound = true;
        }
    }

  const itemId = productFoundInfo.itemId;
  const styleId = productFoundInfo.styleId;

  // set user agent
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
  await page.setViewport({ width: 375, height: 812 });

  // Instructs the blank page to navigate a URL
  console.log("Opening safe browser");
  await page.goto(`https://www.supremenewyork.com/mobile#products/${itemId}/${styleId}`);

  await page.waitForSelector('.cart-button');
}

const checkSoldOut = async (page) => {
  let addToCartElement = await page.$('#cart-update > span');
  const innerText = await page.evaluate(element => element.textContent, addToCartElement);
  var soldOut = innerText.includes('sold out');
  return soldOut;
}

const addToCart = async (page) => {
  let soldOutPresent = await checkSoldOut(page); // returns true or false

  while(soldOutPresent){
    await wait(DELAY);
    soldOutPresent = await checkSoldOut(page);
    await page.reload();
    console.log('sold out, retrying...')
  }

  await page.click('#cart-update > span'); // if its not sold out, click add to cart

  let checkoutButtonVisible = await isElementVisible(page, '#checkout-now');

  while (!checkoutButtonVisible) {
    checkoutButtonVisible = await isElementVisible(page, '#checkout-now');
  }
}

const checkout = async (page) => {
  await page.click('#checkout-now'); // click checkout now after adding to cart is done
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
  await page.$eval('#cnid', el => el.value = `4941605903969210`); // this is a prepaid card with like 30 cents on it
  await page.select('#credit_card_month', `04`);
  await page.select('#credit_card_year', `2025`);
  await page.$eval('#vvv-container > input[type=tel]', el => el.value = `123`);
  await page.click("#order_terms");
  await page.$eval('#g-recaptcha-response', el => el.value = `ff432r32x3rcc4r3r243rc4r43r234r`);
  await wait(DELAY); // wait a little before button is clicked
  await page.click("#submit_button");
  await page.waitForSelector('#checkout-loading-message > span > span'); // let payment processing page load before checking
}

const processPayment = async (page) => {
  wait(100);
  let checkoutProcessingVisible = await isElementVisible(page, '#checkout-loading-message > span > span');

  // waits for payment to go through
  console.log("Payment processing, please wait...");
  while (checkoutProcessingVisible) {
    await wait(DELAY);
    checkoutProcessingVisible = await isElementVisible(page, '#checkout-loading-message > span > span');
  }

  const paymentFailed = page.url().includes("chargeError"); // check if payment failed and returns true or false

  if(paymentFailed){
    console.log("Payment declined");
  }
  else{
    console.log("Payment successful, check your email");
  }
}

async function startSafeBot () {

  const browser = await puppeteer.launch({ 
    headless: true,
  });

  const browserPage = await browser.newPage();

  await generateSupremeBrowser(browserPage);
  await addToCart(browserPage);
  await checkout(browserPage);
  await processPayment(browserPage);
  await browser.close();
}

startSafeBot();