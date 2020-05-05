# SupremeBot
Supreme bot is an automated checkout system that is built with Node.JS that is able to purchase any Supreme product

# Setup
  1. Edit your host file to include botapi.supremenewyork.com, link for guidance - https://support.rackspace.com/how-to/modify-your-hosts-file/ (this step is a necessity for google recaptcha to work)
  2. Clone this repo and download it onto your desktop, name it something like SupremeBot.
  3. CD into SupremeBot and type in 'npm install' - This will install all the libraries needed
  4. CD into frontend and type in 'node server.js' this will start the backend server and the frontend server. The frontend server will be running on http://botapi.supremenewyork.com - if its working, go to chrome, and type in that link, the frontend should be there.
  5. The bot should be up and running now
  
# Fast Mode
  1. Fast mode utilizes the Axios library hence every single step to checkout a product is only done through request and the storing and transferring cookies in the backend
  2. Cookies - Ticket is generated successfully but the browser ticket is not, hence fast mode does not work while ticket is enforced by supreme, you will have to use safemode.
  
# Safe Mode
  1. Safe mode utilizes the Puppeteer library to actual use a real browser. It will find the products using axios since no important cookies are generated during this process, but then it will simulate a human by clicking buttons, and filling in the checkout form.
  2. To currently run safe mode, CD into backend and type in 'node safeBackend.js' - To add your personal information and keywords without the frontend go into safeBackend.js, scroll down to the bottom and type in your information and keywords

# Frontend
  The entire frontend is built in HTML/CSS/JavaScript as well as the library of Bootstrap mainly for the grid system.
  1. Personal Information - Fill out your address and payment information (NO INFORMATION WILL BE STORED, ONCE THE PAGE IS REFRESHED, FORM IS CLEARED)
  2. Product Information - This is the search section to locate products on supreme
    1. Keywords - To find a product named "COVID-19 Box Logo Relief Tee" keywords should be entered as "covid tee" or "covid logo" (no commas necessary)
    2. Category - Currently a category is required to successfuly locate a product (a box logo tee should be under T-Shirts)
    3. Delays - This will be the delay to add to cart and checkout, a recommended delay is usually around 1500 ms
    4. To select either safe mode or fast mode use the drop down
    
 # Recaptcha
  1. Once the product is successfully added to cart, the bot will request a captcha to be solved since captcha bypass is patched for now. Once at checkout, the task status box will display a message saying captcha needed and that's when you should solve and submit, the bot will then continue the checkout proccess.
  
# Issues
  1. Fast mode not currently hooked up fully, having trouble with the proxy server storing cookies and running the browser.
  2. Puppeteer not currently hooked up to the frontend, having trouble with webpack and puppeteer working together since pupeteer already uses a browser and we are running in a browser
