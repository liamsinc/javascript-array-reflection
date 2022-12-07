//------------------------------------------------------------------------------------------------
// CONSTANTS AND VARIABLES
//------------------------------------------------------------------------------------------------

// An array that will act as our database.
let database = [];

// A counter that stores the number of returned results.
let resultCount = 0;

// A boolean which indicates whether the database is empty.
let isEmpty = false;

// A boolean used to force reset the database (dev tool).
// Ensure this is false before deployment/submission/demo:
const resetDB = false;

// Initialize the database:
if (resetDB) {
    database.push({email: '', images: []});
    console.log("Database reset, added empty object!")
    sessionStorage.setItem('database', JSON.stringify(database));
} else if (sessionStorage.getItem('database') === null) {
    database.push({email: '', images: []});
    console.log("No existing database found, added empty object!");
} else {
    database = JSON.parse(sessionStorage.getItem('database'));
    console.log("Database found, contents inherited!");
}

// Arrays that stores the possible URL endings of each page:
const homeURLs = ['index.html', ':5500/', 'array-reflection/', 'scs.co.uk/'];
const searchURLs = ['search.html'];

// An array that stores the IDs of the navigation links:
const $navLinks = ['#nav__home', '#nav__search'];

// A boolean used to represent what page the user is on:
let onHome = false;

// jQuery ID selectors:
const $image = '#image__img';
const $imageBox = '#image__container';
const $submitBtn = '#email__submit';
const $resetBtn = '#image__reset';
const $searchBtn = '#search__submit';
const $resultsBox = '#results__box';
const $resultTitle = '#results__title';
const $emailField = '#email__input';
const $searchField = '#search__input';

// jQuery class selectors:
const $inputMsg = '.input__msg';
const $resultItem = '.results__item';
const $resultEmail = '.results__email';
const $resultImageBox = '.rib';

// CSS class references:
const successMsgClass = 'success-class';
const activeNavClass = 'active-nav-styles';

// Regex pattern to validate the email:
const emailRegex = /^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/;

// URL to fetch:
const url = 'https://picsum.photos/2000';

// Placeholder element shown while an image is loading:
const loadingMsg = '<h2 id="image__loading">Loading random image...</h2>';

// Constants holding messages displayed to the user:
const emailNullMsg = "Please enter your email!";
const emailFormatMsg = "Please enter a valid email!";
const submitSuccessMsg = "Your request was submitted successfully!";
const emailNotFoundMsg = "Match not found!";
const emailFoundMsg = "Match found!";
const resPrefix = "Showing results for: ";

// Constants holding pieces of HTML markup (search page):
const resHTML1 = `<div class="results__item"><h3 class="results__email">`;
const resHTML2 = `</h3><div class="results__img__box rib`;
const resHTML3 = `"></div></div>`;
const resHTML4 = `<img class="results__image" src="`;
const resHTML5 = `" alt="Image #`;
const resHTML6 = ` from `;
const resHTML7 = `">`;

// Constants holding pieces of HTML markup (home page):
const imgHTML1 = `<img id="image__img" src="`;
const imgHTML2 = `" alt="A random image">`;

// Custom console error message:
const consoleErr = "Error: Cannot determine active link for ";

// Settings for DOMPurify:
const purifyConfig = {
    ALLOWED_TAGS: ['', ''],
    KEEP_CONTENT: true
};

//------------------------------------------------------------------------------------------------
// FUNCTIONS START
//------------------------------------------------------------------------------------------------

// GENERIC FUNCTIONS

/* 
setNavStyles()
Usage: Invoked by detectPage()
Parameters:
1. isHome: a boolean value (is the homepage the current page?)
2. className: the name of the CSS class to apply/remove.
Purpose: Applies and removes a CSS class from the nav elements to provide a visual
indication of the page currently being viewed.
*/

function setNavStyles (isHome, className) {
    if (isHome) {
        $($navLinks[0]).addClass(className);
        $($navLinks[1]).removeClass(className);
    } else {
        $($navLinks[1]).addClass(className);
        $($navLinks[0]).removeClass(className);  
    }
};

/* 
setOnHome()
Usage: Invoked by detectPage()
Parameters:
1. isHome: a boolean value (is the homepage the current page?)
Purpose: Reassign the global onHome boolean dependant on current page.
*/

function setOnHome (isHome) {
    (isHome) ? onHome = true : onHome = false;
};

/* 
reloadPage()
Usage: Invoked by submit()
Purpose: Reloads the current page. Wrapped in a function to support usage with 
setTimeout().
*/

function reloadPage() {
    location.reload();
};

/* 
tempHideSubmit()
Usage: Invoked by onPageLoad() and the reset button click handler.
Purpose: Hides the submit button, waits 1.5 seconds, then slides it down into view.
Reduces cases where null image URL values are passed to the database if user spams submit.
*/

function tempHideSubmit() {
    $($submitBtn).hide().delay(1500).slideDown();
};

/* 
detectPage()
Usage: Invoked by onPageLoad()
Parameters:
1. hURLs: an array containing the list of possible URL endings of the home page.
2. sURLs: an array containing the list of possible URL endings of the search page.
Purpose: Determines the currently viewed page based on the URL ending. Invokes setNavStyles
and setOnHome once page has been determined.
*/

function detectPage(hURLs, sURLs) {
    const currentURL = window.location.href;
    for (let i = 0; i < hURLs.length; i++) {
        if (currentURL.endsWith(hURLs[i])) {
            setNavStyles(true, activeNavClass);
            setOnHome(true);
            break;
        } else {
            for (let j = 0; j < sURLs.length; j++) {
                if (currentURL.endsWith(sURLs[j])) {
                    setNavStyles(false, activeNavClass);
                    setOnHome(false);
                } else {
                    console.log(`${consoleErr}${currentURL}`);
                }
            }
        }
    }
};

/* 
onRetrieve()
Usage: Invoked by retrieveSingle() and retrieveAll().
Purpose: Empties the HTML element where results are inserted and sets the global
resultCount variable to 0;
*/

function onRetrieve() {
    $($resultsBox).empty();
    resultCount = 0; 
};

/* 
setResultTitle()
Usage: Invoked by retrieveSingle() and retrieveAll().
Parameters:
1. isAll: a boolean value (are we returning all the objects in the database?)
2. email: an optional parameter that specifies the email searched for.
Purpose: If isAll is true, sets the text content of the result title HTML element.
If isAll is false, sets the text content using the email that was searched for.
*/

function setResultTitle(isAll, email = null,) {
    (isAll) ? title = `${resPrefix} All` : title = `${resPrefix} ${email}`;
    $($resultTitle).text(title);  
};

/* 
setInputMsg()
Usage: Invoked by submit(), search() and getEmailValidity().
Parameters:
1. isSuccess: a boolean value (is the message we are setting a success message?).
2. msg: the message to set as the text content.
Purpose: Used by a few functions to set the text content on the input field message whether 
it be an error or success message.
*/

function setInputMsg(isSuccess, msg) {
    if (isSuccess) {
        $($inputMsg).addClass(successMsgClass).text(msg);
    } else {
        $($inputMsg).removeClass(successMsgClass).text(msg);
    }
}

// HTML GENERATION FUNCTIONS

/* 
generateImage()
Usage: Invoked by loadImage().
Parameters:
1. image: the url of the random image to insert into the HTML.
Purpose: Builds the image tag using pre-built strings, using the supplied image url.
Inserts the built image tag into the HTML.
*/

function generateImage(image) {
    const randomImage = `${imgHTML1}${image}${imgHTML2}`;
    $($imageBox).html(randomImage);
};

/* 
generateResult()
Usage: Invoked by retrieveSingle() and retrieveAll().
Parameters:
1. email: the associated email address the results are linked to.
2. images: an array of all images linked to the email address.
Purpose: Constructs a result container for every email passed to it, while also displaying
all images associated with that email. Utilises dynamic allocation of class names to avoid
undesired behaviour when appending multiple images. If the email passed is empty, then skip
this function, set isEmpty to true and then set the text content of the result title element.
*/

function generateResult(email, images) {
    if (email != '') {
        isEmpty = false;
        const html = `${resHTML1}${email}${resHTML2}${resultCount}${resHTML3}`;
        $($resultsBox).append(html);
        const resultToTarget = `${$resultImageBox}${resultCount}`;

        for (let i = 0; i < images.length; i++) {
            const img = `${resHTML4}${images[i]}${resHTML5}${i+1}${resHTML6}${email}${resHTML7}`;
            $(resultToTarget).append(img);
        }
    } else {
        isEmpty = true;
        $($resultTitle).text("The database is empty!");
    }
    
};

// INPUT AND VALIDATION FUNCTIONS

/* 
grabPurifyInput()
Usage: Invoked by onSubmit().
Parameters:
1. $targetInput: the jQuery selector of the input field to grab.
Purpose: Trims the value of the target input, sanitizes it using DOMPurify and then
returns the value to the caller.
*/

function grabPurifyInput($targetInput) {
    return value = DOMPurify.sanitize (
        $($targetInput).val().trim(), 
        purifyConfig
    );
};

/* 
getEmailValidity()
Usage: Invoked by onSubmit().
Parameters:
1. email: the email to validate.
Purpose: Checks the email is not null and conforms the format standard using regex.
If invalid, display an error message (invoke setInputMsg) and return false to the caller.
If valid, return true.
*/

function getEmailValidity(email) {
    if (email === '') {
        setInputMsg(false, emailNullMsg);
        return false;
    } else if (!email.match(emailRegex)) {
        setInputMsg(false, emailFormatMsg);
        return false;
    } else {
        return true;
    }
};

// IMAGE FETCH FUNCTIONS

/* 
checkStatus()
Usage: Invoked by fetchImage().
Parameters:
1. response: the response from the fetch call.
Purpose: Resolves or rejects the promise dependant on the response
Returns the error if rejected.
*/

function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
};

/* 
fetchImage()
Usage: Invoked by loadImage().
Parameters:
1. url: the url to fetch the random image from.
Purpose: Returns the result of the fetch call to the invoking function. Invokes checkStatus
and logs any errors.
*/

function fetchImage(url) {
   return fetch(url)
    .then(checkStatus)
    .catch(error => console.log(error));
};

/* 
loadImage()
Usage: Invoked by onPageLoad().
Purpose: Displays the loading placeholder text while an image loads, then invokes fetchImage.
Derives the image url from the object returned (data) and passes this to the generateImage function.
*/

function loadImage() {
    $($imageBox).html(loadingMsg);
    Promise.all([
        fetchImage(url)
    ]).then(data => {
        let randomImage = data[0].url;
        generateImage(randomImage);
    });
};

// DATABASE FUNCTIONS

/* 
updateDatabase()
Usage: Invoked by submit().
Parameters:
1. email: the email to add/update.
2. url: the url of the image to attach to the email.
Purpose: When called, it will iterate through the database checking for an email match or an empty object.
The second condition accounts for the existence of a freshly initialized database with a single empty object.
If either of the above conditions are met, overwrite the email stored (if one exists) or store the email 
(if database has empty object) and push the image url to the associated images array.
If a match is not found and there is no empty object in the array, set addObject to true and push a new object
to the database using the email and image url provided. Finally, save the stringified database array to the session
storage.
*/

function updateDatabase(email, url) {
    let addObject = false;
    for (let i = 0; i < database.length; i++) {
        if (database[i].email === email || database[i].email === '') {
            database[i].email = email;
            database[i].images.push(url);
            addObject = false;
            break;
        } 
        addObject = true;
    }
    if (addObject) {
        database.push({email: email, images: [url]});
    }
    sessionStorage.setItem('database', JSON.stringify(database));
};

/* 
checkEmailExists()
Usage: Invoked by search().
Parameters:
1. email: the email to check the existence of.
Purpose: Checks if an email exists in the database. Returns a boolean value to the caller.
*/

function checkEmailExists(email) {
    let emailExists;
    for (let i = 0; i < database.length; i++) {
        if (database[i].email === email) {
            emailExists = true;
            break;
        } else {
            emailExists = false;
        }
    }
    return emailExists;
};

/* 
retrieveSingle()
Usage: Invoked by search().
Parameters:
1. email: the email we need to retrieve the results for.
Purpose: Invoke onRetrieve to clear any existing results from view and reset the resultCount
variable. Based on the email provided, get the relevant email and images array, increment the result
count, set the result title using the retrieved email and generate the result, passing in the email value
and associated images array. Returns a single object from the database.
*/

function retrieveSingle(email) {
    onRetrieve();
    for (let i = 0; i < database.length; i++) {
        if (database[i].email === email) {
            const retrievedEmail = database[i].email;
            const retrievedImages = database[i].images;
            resultCount++;
            setResultTitle(false, retrievedEmail);
            generateResult(retrievedEmail, retrievedImages);
            break;
        }
    }
};

/* 
retrieveAll()
Usage: Invoked by search().
Purpose: For every object in the database array, get the email and associated images array and
invoke generateResult, passing in the email and linked images array. If global variable isEmpty
is false, set the result title. 
Returns the entire database.
*/

function retrieveAll() {
    onRetrieve();
    for (let i = 0; i < database.length; i++) {
        const retrievedEmail = database[i].email;
        const retrievedImages = database[i].images;
        resultCount++;
        generateResult(retrievedEmail, retrievedImages);
    }
    if (!isEmpty) {
        setResultTitle(true);
    }
    
};

// SEARCH / SUBMIT

/* 
search()
Usage: Invoked by onSubmit().
Parameters:
1. email: the email address to search for.
2. emailValid: a boolean indicating whether the email is valid.
Purpose: If the email is valid, invoke checkEmailExists() and set the local const emailExists.
If the email exists, set the input message and invoke retrieveSingle(). If the email does not exist,
set the input message and invoke retrieveAll(). If the email is not valid, just return the entire database.
*/

function search(email, emailValid) {
    if (emailValid) {
        const emailExists = checkEmailExists(email);
        if (emailExists) {
            setInputMsg(true, emailFoundMsg);
            retrieveSingle(email);
        } else {
            setInputMsg(false, emailNotFoundMsg);
            retrieveAll();
        }
    } else {
        retrieveAll();
    }
};

/* 
submit()
Usage: Invoked by onSubmit().
Parameters:
1. email: the email address to submit.
2. emailValid: a boolean indicating whether the email is valid.
Purpose: If the email is valid, grab the src attribute of the current random image.
Then invoke updateDatabase(), passing the email and image url to it. Set the input message,
slide up the submit button to avoid submission of null url values while new image is loading.
Reload the page after 1.5 seconds (gives user chance to read submission success message).
*/

function submit(email, emailValid) {
    if (emailValid) {
        const url = $($image).attr('src');
        updateDatabase(email, url);
        setInputMsg(true, submitSuccessMsg);
        $($submitBtn).slideUp();
        setTimeout(reloadPage, 1500);
    }
};

/*
onSubmit()
Usage: Invoked by the submit button and the search button click handlers.
Parameters:
1. targetElement: the target input field to grab the value of.
Purpose: Set the local const input equal to the return value of grabPurifyInput().
Set the local const emailValid equal to the return value of getEmailValidity().
Invoke submit() or search() dependant on the value of onHome, passing in the input and
the emailValid boolean.
*/

function onSubmit(targetElement) {
    const input = grabPurifyInput(targetElement);
    const emailValid = getEmailValidity(input);
    (onHome) ? submit(input, emailValid) : search(input, emailValid);
};

/*
onPageLoad()
Usage: Invoked immediately.
Purpose: Invoke detectPage(), which will determine the active page, then invoke setNavStyles()
and setOnHome(). Then, depending on the current page, invoke other functions. If we are on the
homepage, we want to hide the submit button and load the random image. If we are on the search
page, return the entire database by default.
*/

function onPageLoad() {
    detectPage(homeURLs, searchURLs);
    if (onHome) {
        tempHideSubmit();
        loadImage(); 
    } else {
        retrieveAll();
    }
}

//------------------------------------------------------------------------------------------------
// GENERAL CODE
//------------------------------------------------------------------------------------------------

// Invoke onPageLoad wrapper function
onPageLoad();

// Handler for the submit button (home page):
$($submitBtn).on('click', (event) => {
    event.preventDefault();
    onSubmit($emailField);
});

// Handler for the reset button (home page):
$($resetBtn).on('click', () => {
    loadImage();
    tempHideSubmit();
});

// Handler for the search button (search page):
$($searchBtn).on('click', (event) => {
    event.preventDefault()
    onSubmit($searchField);
});