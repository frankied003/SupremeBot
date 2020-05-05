const puppeteer = require('puppeteer');
var productSearch = require('./productSearchCMD');

// not hooked up to frontend yet because of puppeteer and webpack not working well together

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

// wait function for delays
const wait = async (delay) => {
  await new Promise(function(resolve) {setTimeout(resolve, delay)});
}


// supreme botting functions
const generateSupremeBrowser = async (page,category,keywords,color,size) => {

  let itemFound = false;
    let productFoundInfo;
    while(!itemFound){
        const allProducts = await productSearch.getSupremeProducts();
        productFoundInfo = await productSearch.productSearch(allProducts, category, keywords, color, size);
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
  console.log('Opening safe browser');
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
  
  await wait(DELAY);
  await page.click('#cart-update > span'); // if its not sold out, click add to cart

  let checkoutButtonVisible = await isElementVisible(page, '#checkout-now');

  while (!checkoutButtonVisible) {
    checkoutButtonVisible = await isElementVisible(page, '#checkout-now');
  }
}

const checkout = async (page, userInfo) => {
  await page.click('#checkout-now'); // click checkout now after adding to cart is done
  console.log('Added to cart, going to checkout...');

  // waits for form to load
  let checkoutFormVisible = await isElementVisible(page, '#order_bn');

  while (!checkoutFormVisible) {
    checkoutFormVisible = await isElementVisible(page, '#order_bn');
  }

  console.log('Checkout loaded, filling payment...');
  
  // filling in billing
  await page.$eval('#order_bn', (el,value) => el.value = value, userInfo.name);
  await page.$eval('#order_email', (el,value) => el.value = value, userInfo.email);
  await page.$eval('#order_tel', (el,value) => el.value = value, userInfo.phoneNumber);
  await page.$eval('#order_billing_address', (el,value) => el.value = value, userInfo.billingAddress1);
  await page.$eval('#order_billing_address_2', (el,value) => el.value = value, userInfo.billingAddress2);
  await page.$eval('#obz', (el,value) => el.value = value, userInfo.zipCode);
  await page.$eval('#order_billing_city',(el,value) => el.value = value, userInfo.billingCity);
  await page.select('#order_billing_state', userInfo.billingState);
  await page.select('#order_billing_country', userInfo.billingCountry);
  await page.$eval('#cnid', (el,value) => el.value = value, userInfo.creditCardNum); // this is a prepaid card with like 30 cents on it
  await page.select('#credit_card_month', userInfo.creditCardMonth);
  await page.select('#credit_card_year', userInfo.creditCardYear);
  await page.$eval('#vvv-container > input[type=tel]',(el,value) => el.value = value, userInfo.cvv);
  await page.click('#order_terms');
  await page.$eval('#g-recaptcha-response', (el,value) => el.value = value, userInfo.gRecaptchaRes);
  await wait(DELAY); // wait a little before button is clicked
  await page.click('#submit_button');
  await page.waitForSelector('#checkout-loading-message > span > span'); // let payment processing page load before checking
}

const processPayment = async (page) => {
  await wait(2000);
  let checkoutProcessingVisible = await isElementVisible(page, '#checkout-loading-message > span > span');

  // waits for payment to go through
  console.log('Payment processing, please wait...');
  while (checkoutProcessingVisible) {
    await wait(DELAY);
    checkoutProcessingVisible = await isElementVisible(page, '#checkout-loading-message > span > span');
  }

  const paymentFailed = page.url().includes('chargeError'); // check if payment failed and returns true or false

  if(paymentFailed){
    console.log('Payment declined');
  }
  else{
    console.log('Payment successful, check your email');
  }
}

async function startSafeBot (headlessBool) {

  const browser = await puppeteer.launch({ 
    headless: headlessBool,
  });

  const browserPage = await browser.newPage();

  // enter personal information here
  const userData = {
    'name': 'frank digiacomo',
    'email': 'frankied324234234@gmail.com',
    'phoneNumber': '914-123-1234',
    'billingAddress1': '123 testing lane',
    'billingAddress2': '',
    'zipCode': '12345',
    'billingCity': 'test',
    'billingState': 'NY',
    'billingCountry': 'USA',
    'creditCardNum': '4941605903969210',
    'creditCardMonth': '04',
    'creditCardYear': '2025',
    'cvv': '123',
    'gRecaptchaRes': "3e232d32cf4d34343d434132d4124c234d24"
  };

  await generateSupremeBrowser(browserPage,1,'beaded','Black','N/A'); // enter keywords here (browserPage, keywords, color, size)
  await addToCart(browserPage);
  await checkout(browserPage, userData);
  await processPayment(browserPage);
  await browser.close();
}

startSafeBot(headless = false);

module.exports = {
  startSafeBot:startSafeBot
}