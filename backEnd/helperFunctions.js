const axios = require("axios");
const cheerio = require("cheerio");

// creating a simple axios session so all cookies are stored throughout the checkout process
const session = axios.create({
    withCredentials: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    }
  });

// timer function for delays
const timer = ms => new Promise( res => setTimeout(res, ms));

// function for simple get requests
const redirectTo = async (redirectLink, delay, successfullMessage, errorMessage) => {

    while(true){

        try{
            const getRedirect = await session.get(redirectLink);

            if(getRedirect.status === 200){
                console.log(successfullMessage);
                return getRedirect.data;
            }
            
            else {
                console.log(errorMessage)
                await timer(delay);
            }
        }

        catch(err){
            console.log(err);
        }
    }
}

module.exports = {
    redirectTo: redirectTo
}