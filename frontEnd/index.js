function clear(){
    document.getElementById("Fname").value= ""
    document.getElementById("Lname").value= ""
    document.getElementById("Phone").value= ""
    document.getElementById("Email").value= ""
    document.getElementById("Saddress").value= ""
    document.getElementById("Zip").value= ""
    document.getElementById("country").value= "- country -"
    document.getElementById("state").value= "- state -"
    document.getElementById("cardtype").value= "- card type"
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

function test(){
    document.getElementById("Fname").value= "John"
    document.getElementById("Lname").value= "Smith"
    document.getElementById("Phone").value= "1234567890"
    document.getElementById("Email").value= "Jsmith@domain.com"
    document.getElementById("Saddress").value= "123 Main Street"
    document.getElementById("Zip").value= "12345"
    document.getElementById("country").value= "United States of America"
    document.getElementById("state").value= "NJ"
    document.getElementById("cardtype").value= "AE"
    document.getElementById("Cname").value= "JOHN H SMTIH"
    document.getElementById("Cnumber").value= "1234567890101112"
    document.getElementById("CVV").value= "123"
    document.getElementById("cardmonth").value= "01"
    document.getElementById("cardyear").value= "2035"
    document.getElementById("category").value= "Jacket"
    document.getElementById("kword").value= "Supreme Jacket"
    document.getElementById("delay").value= "120"
    document.getElementById("color").value= "C2"
    document.getElementById("size").value= "L"
}

function TestButton(){
    console.log("hello");
}

function storeRecaptchaResponse(){
    let recaptchaResponse = document.getElementById("g-recaptcha-response").value;
    document.getElementById("taskStatus").value = recaptchaResponse;
    grecaptcha.reset();
    return recaptchaResponse;
}
