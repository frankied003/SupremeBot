const axios = require('axios');
const qs = require('qs');

// constants
const RETRY_DELAY = 1000;

// creating a simple axios session so all cookies are stored throughout the checkout process
const session = axios.create({
    baseURL: `http://botapi.supremenewyork.com:8050`,
    timeout: 10000
  });

// timer function for delays
const timer = ms => new Promise( res => setTimeout(res, ms));

// function for simple get requests
const redirectTo = async (redirectLink, delay, successfullMessage, errorMessage) => {

    while(true){

        try{
            const getRedirect = await session.get(redirectLink);

            if(getRedirect.status === 200){
                if(successfullMessage != null){
                    window.updateTaskStatus(successfullMessage);
                    console.log(successfullMessage);
                }
                await timer(delay);
                return getRedirect;
            }
            
            else {
                window.updateTaskStatus(errorMessage);
                console.log(errorMessage)
                await timer(delay);
            }
        }

        catch(err){
            window.updateTaskStatus(errorMessage);
            console.log(err);
            await timer(delay);
        }
    }
}

const postTo = async (endpointLink, data, postDelay, successfullMessage, errorMessage) => {

    while(true){

        try{
            await timer(postDelay);

            const postRequest = await session.post(endpointLink, qs.stringify(data));

            if(postRequest.status === 200){
                window.updateTaskStatus(successfullMessage);
                console.log(successfullMessage);
                return postRequest;
            }
            
            else {
                window.updateTaskStatus(errorMessage);
                console.log(errorMessage)
                await timer(RETRY_DELAY);
            }
        }

        catch(err){
            window.updateTaskStatus(errorMessage);
            console.log(err);
            await timer(delay);
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
                window.updateTaskStatus(successfullMessage);
                console.log(successfullMessage);
                return postRequest;
            }
            
            else {
                window.updateTaskStatus(errorMessage);
                console.log(errorMessage)
                await timer(RETRY_DELAY);
            }
        }

        catch(err){
            window.updateTaskStatus(errorMessage);
            console.log(err);
            await timer(RETRY_DELAY);
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
                window.updateTaskStatus(successfullMessage);
                console.log(successfullMessage);
                await timer(delay);
                return getRedirect;
            }
            
            else {
                window.updateTaskStatus(errorMessage);
                console.log(errorMessage)
                await timer(delay);
            }
        }

        catch(err){
            window.updateTaskStatus(errorMessage);
            console.log(err);
            await timer(RETRY_DELAY);
        }
    }
}


module.exports = {
    postTo: postTo,
    redirectTo: redirectTo,
    postToWithHeaders: postToWithHeaders,
    redirectToWithHeaders: redirectToWithHeaders
}