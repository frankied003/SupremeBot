const axios = require("axios");
const cheerio = require("cheerio");
const qs = require('qs');

// constants
const RETRY_DELAY = 1000;

// creating a simple axios session so all cookies are stored throughout the checkout process
const session = axios.create({
    withCredentials: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    }
  });

// timer function for delays
const timer = ms => new Promise( res => setTimeout(res, ms));

// function for simple get requests
const redirectTo = async (redirectLink, delay, successfullMessage, errorMessage) => {

    while(true){

        try{
            const getRedirect = await session.get(redirectLink, {withCredentials: true});

            if(getRedirect.status === 200){
                console.log(successfullMessage);
                return getRedirect;
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

const postTo = async (endpointLink, data, postDelay, successfullMessage, errorMessage) => {

    while(true){

        try{
            await timer(postDelay);

            const postRequest = await session.post(endpointLink, qs.stringify(data), {withCredentials: true});

            if(postRequest.status === 200){
                console.log(successfullMessage);
                return postRequest;
            }
            
            else {
                console.log(errorMessage)
                await timer(RETRY_DELAY);
            }
        }

        catch(err){
            console.log(err);
        }
    }
}

module.exports = {
    postTo: postTo,
    redirectTo: redirectTo
}