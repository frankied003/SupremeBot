var backendScript = require('../backEnd/backend');
// var safeBackendScript = require('../backEnd/safeBackend');

document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    //Your code to bind event handler

    document.getElementById("clearButton").onclick = function (){
        document.getElementById("Fname").value= ""
        document.getElementById("Lname").value= ""
        document.getElementById("Phone").value= ""
        document.getElementById("Email").value= ""
        document.getElementById("Saddress").value= ""
        document.getElementById("Zip").value= ""
        document.getElementById("country").value= "- country -"
        document.getElementById("state").value= "- state -"
        document.getElementById("cardtype").value= "- card type -"
        document.getElementById("Cname").value= ""
        document.getElementById("Cnumber").value= ""
        document.getElementById("CVV").value= ""
        document.getElementById("cardmonth").value= ""
        document.getElementById("cardyear").value= ""
        document.getElementById("category").value= "- category -"
        document.getElementById("kword").value= ""
        document.getElementById("delay").value= ""
        document.getElementById("color").value= ""
        document.getElementById("size").value= "n/a"
    }
});

function getInputValues(){
    let firstName = document.getElementById("Fname").value;
    let lastName = document.getElementById("Lname").value;
    let phone = document.getElementById("Phone").value;
    let email = document.getElementById("Email").value;
    let address = document.getElementById("Saddress").value;
    let zip = document.getElementById("Zip").value;
    let country = document.getElementById("country").value;
    let state = document.getElementById("state").value;
    let cardtype = document.getElementById("cardtype").value;
    let cardName = document.getElementById("Cname").value;
    let cardNumber = document.getElementById("Cnumber").value;
    let cvv = document.getElementById("CVV").value;
    let cardMonth = document.getElementById("cardmonth").value;
    let cardYear = document.getElementById("cardyear").value;
    let category = document.getElementById("category").value;
    let keyWords = document.getElementById("kword").value;
    let delay = document.getElementById("delay").value;
    let color = document.getElementById("color").value;
    let size = document.getElementById("size").value;

    return inputDict = {
        firstName,
        lastName,
        phone,
        email,
        address,
        zip,
        country,
        state,
        cardtype,
        cardName,
        cardNumber,
        cvv,
        cardMonth,
        cardYear,
        'categoryNum': parseInt(category),
        keyWords,
        delay,
        color,
        size
    };
}

function test(){
    document.getElementById("Fname").value= "John"
    document.getElementById("Lname").value= "Smith"
    document.getElementById("Phone").value= "1234567890"
    document.getElementById("Email").value= "Jsmith@domain.com"
    document.getElementById("Saddress").value= "123 Main Street"
    document.getElementById("Zip").value= "12345"
    document.getElementById("country").value= "USA"
    document.getElementById("state").value= "NJ"
    document.getElementById("cardtype").value= "AE"
    document.getElementById("Cname").value= "JOHN H SMTIH"
    document.getElementById("Cnumber").value= "1234567890101112"
    document.getElementById("CVV").value= "123"
    document.getElementById("cardmonth").value= "01"
    document.getElementById("cardyear").value= "2035"
    document.getElementById("category").value= "jackets"
    document.getElementById("kword").value= "Supreme Jacket"
    document.getElementById("delay").value= "120"
    document.getElementById("color").value= "C2"
    document.getElementById("size").value= "L"
}

function startBot(){
    let botOption = document.getElementsByClassName("bot-option")[0];
    let frontendInputs = getInputValues();
    if (botOption.value === "safe"){
        // safeBackendScript.startSafeBot();
        console.log("Hello");
    }
    else {
        backendScript.startFastBot(frontendInputs.categoryNum, frontendInputs.keyWords, frontendInputs.color, frontendInputs.size);
    }
    
}

function updateTaskStatus(message){
    document.getElementById("taskStatus").value += `\n ${message}`;
}

function storeRecaptchaResponse(){
    let recaptchaResponse = document.getElementById("g-recaptcha-response").value;
    updateTaskStatus(recaptchaResponse);
    grecaptcha.reset();
    return recaptchaResponse;
}

module.exports = {
    test: test,
    startBot: startBot,
    storeRecaptchaResponse: storeRecaptchaResponse,
    updateTaskStatus: updateTaskStatus
}

window.test = test;
window.startBot = startBot;
window.storeRecaptchaResponse = storeRecaptchaResponse;
window.updateTaskStatus = updateTaskStatus;