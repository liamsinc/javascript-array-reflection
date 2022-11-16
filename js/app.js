/*
VARIABLES/CONSTANTS
*/

// Declare an empty array.
var database = [];

/*
Constant used to force reset the database (dev tool):
Ensure this is false before deployment/submission.
You can also reset the database by clearing the site cookies/data 
and then reloading.
*/
const resetDB = false;

/*
Conditional which sets the value of the database array:
1. If resetDB is true, reset the database, add an empty object and save the stringified database
    to the session storage.
2. Else if a database doesn't exist in session storage, add an 
    empty object to the database.
3. Else a database must exist in session storage, so overwrite the local database
    with the existing database.
*/

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

console.log(database);


// Used in applyActiveNavStyles():
const homeURLs = ['index.html', ':5500/']; // Holds possible home URL endings
const searchURLs = ['search.html']; // Holds possible search URL endings
const $navLinks = ['#nav__home', '#nav__search']; // Holds the IDs of the two nav links
const activeNavClass = 'active-nav-styles'; // The name of the class to be applied

// The ID of the random image:
const $image = '#theImage';

// The container for the image:
const $imageBox = '#image__container';

// The URL I want to fetch from:
const url = 'https://picsum.photos/1920';

// The regex pattern to validate the email:
const emailRegex = /^[_\.0-9a-zA-Z-]+@([0-9a-zA-Z][0-9a-zA-Z-]+\.)+[a-zA-Z]{2,6}$/;

// Container variables for error messages:
const emailNullError = "Please enter your email!";
const emailFormatError = "Please enter a valid email! (Invalid Format)";

// Other jQuery constant:
const $homeSubmitBtn = '#email__submit';
const $emailField = '#email__input';
const $emailError = '.email__error';

// Settings for DOMPurify:
const purifyConfig = {
    ALLOWED_TAGS: ['', ''],
    KEEP_CONTENT: true
};

/* 
Function applyActiveNavStyles(hURLs, sURLs);
Invoked on page load.
hURLs = an array containing the possible URL endings of the home page.
sURLs = an array containing the possible URL endings of the search page.
*/

function applyActiveNavStyles(hURLs, sURLs) {
    let currentURL = window.location.href;

    for (let i = 0; i < hURLs.length; i++) {
        if (currentURL.endsWith(hURLs[i])) {
            $($navLinks[0]).addClass(activeNavClass);
            $($navLinks[1]).removeClass(activeNavClass);
            break;
        } else {
            for (let j = 0; j < sURLs.length; j++) {
                if (currentURL.endsWith(sURLs[j])) {
                    $($navLinks[1]).addClass(activeNavClass);
                    $($navLinks[0]).removeClass(activeNavClass);
                } else {
                    console.log(`Error: Cannot determine active link for ${currentURL}`);
                }
            }
        }
    }
};

/* 
Function checkEmail(email);
Invoked by function onSubmit().
email = the value of the sanitized input field, passed to it by function onSubmit().
Runs a series of checks, return either true or false to function onSubmit() depending
on the validity of the email passed to it.
*/

function checkEmail(email) {
    if (email === '') {
        $($emailError).text(emailNullError);
        return false;
    } else if (!email.match(emailRegex)) {
        $($emailError).text(emailFormatError)
        return false;
    } else {
        return true;
    }
};

/* 
Function updateDatabase(email, url);
Invoked by function onSubmit().
email = the value of the sanitized input field, passed to it by function onSubmit().
url = the url of the current random image, passed to it by function onSubmit().
DESCRIPTION NEEDED!
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
}

/* 
Function fetchImage(url);
Invoked on page load.
url = the predefined API url (global constant).
Invokes checkStatus(), catch any errors. Returns the data object.
*/

function fetchImage(url) {
   return fetch(url)
    .then(checkStatus)
    .catch(error => console.log(error));
}

/* 
Function checkStatus();
Invoked by function fetchImage().
Returns either the resolved or rejected promise to fetchImage().
*/

function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

/* 
Function generateImage(image);
Invoked on page load.
image = the url of the random image url returned by the fetch call.
Sets the source attribute of the image elemtent.
*/

function generateImage(image) {
    let imageElement = `<img id='theImage' src='${image}' alt='A random image'>`;
    $($imageBox).html(imageElement);
}

/* 
Function onSubmit(event);
Invoked by $homeSubmitBtn click handler.
event = the event passed by the click handler.
1. Prevents the default action.
2. Grabs and sanitizes the value of $emailField.
3. Invokes checkEmail, passing in the sanitized email and 
    assigning the return value to emailValid.
4. If emailValid is true, grab the current image url and invoke updateDatabase(),
    passing in the email and the url of the current image.
*/

function onSubmit(event) {
    event.preventDefault();

    const email = DOMPurify.sanitize (
        $($emailField).val().trim(), 
        purifyConfig
    );

    const emailValid = checkEmail(email);

    if (emailValid) {
        let url = $($image).attr('src');
        updateDatabase(email, url);
        location.reload();
    }
}

/*
FUNCTIONS END
----------------------------------------------------------------
GENERAL CODE START
*/

// Fetch then generate the image
Promise.all([
    fetchImage(url)
]).then(data => {
    let randomImage = data[0].url;
    generateImage(randomImage);
})

// Apply the active nav styles:
applyActiveNavStyles(homeURLs, searchURLs);


// Handler for the submit button
$($homeSubmitBtn).on('click', (event) => onSubmit(event));


