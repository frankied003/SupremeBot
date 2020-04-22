const axios = require("axios");
const cheerio = require("cheerio");
const qs = require('qs');

// constants
const RETRY_DELAY = 1000;

// creating a simple axios session so all cookies are stored throughout the checkout process
const session = axios.create({
    baseURL: "https://www.supremenewyork.com",
    withCredentials: true,
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1',
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
                await timer(delay);
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

            const postRequest = await session.post(endpointLink, qs.stringify(data));

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

const postToWithHeaders = async (endpointLink, data, headersToPost, postDelay, successfullMessage, errorMessage) => {

    while(true){

        try{
            await timer(postDelay);

            const postRequest = await session.post(endpointLink, qs.stringify(data), {
                headers: headersToPost
            });

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

const redirectToWithHeaders = async (redirectLink, headersToPost, delay, successfullMessage, errorMessage) => {

    while(true){

        try{
            const getRedirect = await session.get(redirectLink, {
                headers: headersToPost
            });

            if(getRedirect.status === 200){
                console.log(successfullMessage);
                await timer(delay);
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


module.exports = {
    postTo: postTo,
    redirectTo: redirectTo,
    postToWithHeaders: postToWithHeaders,
    redirectToWithHeaders: redirectToWithHeaders
}