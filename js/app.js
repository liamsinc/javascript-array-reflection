//------------------------------------------------------------------------------------------------
// CONSTANTS AND VARIABLES
//------------------------------------------------------------------------------------------------

// An array that will act as our database.
let database = [];

// A counter that stores the number of returned results.
let resultCount = 0;

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
const homeURLs = ['index.html', ':5500/'];
const searchURLs = ['search.html'];

// An array that stores the IDs of the navigation links:
const $navLinks = ['#nav__home', '#nav__search'];

// A boolean used to determine whether to make the fetch request:
let isHome = false;

// jQuery ID selectors:
const $image = '#image__img';
const $imageBox = '#image__container';
const $submitBtn = '#email__submit';
const $resetBtn = '#image__reset';
const $searchBtn = '#search__submit';
const $resultsBox = '#results__box';
const $resultsTitle = '#results__title';
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
const resultsPrefix = "Showing results for: ";

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

/* 
Function: applyActiveNavStyles(hURLs, sURLs):
Invoked: On page load.
Parameters:
    1.  hURLs = an array containing the URL endings of index.html
    2.  sURLs = an array containing the URL endings of search.html
Purpose:
    1.  Determine the current page, and apply activeNavClass to the relevant nav element.
    2.  Reassign global variable isHome dependant on current page.
Features:
    1.  If the current page is determined to be home, break out of the loop - no need
        to continue inner loop.
    2.  Helpful else clause if current page cannot be determined - print the current url
        so I can add the ending to the relevant array.
*/

function applyActiveNavStyles(hURLs, sURLs) {
    const currentURL = window.location.href;
    for (let i = 0; i < hURLs.length; i++) {
        if (currentURL.endsWith(hURLs[i])) {
            $($navLinks[0]).addClass(activeNavClass);
            $($navLinks[1]).removeClass(activeNavClass);
            isHome = true;
            break;
        } else {
            for (let j = 0; j < sURLs.length; j++) {
                if (currentURL.endsWith(sURLs[j])) {
                    $($navLinks[1]).addClass(activeNavClass);
                    $($navLinks[0]).removeClass(activeNavClass);
                    isHome = false;
                } else {
                    console.log(`${consoleErr}${currentURL}`);
                }
            }
        }
    }
};

/* 
Function: checkEmailValidity(email):
Invoked: By functions onSubmit() and onSearch().
Parameters:
    1.  email = the email to validate.
Purpose:
    1.  Perform checks on the email. 
    2.  Set the text of $inputMsg if email isn't valid.
    2.  Return true if email is valid, false if not.
Features:
    1.  Removes the successMsgClass as a precautionary measure.
*/

function checkEmailValidity(email) {
    $($inputMsg).removeClass(successMsgClass);
    if (email === '') {
        $($inputMsg).text(emailNullMsg);
        return false;
    } else if (!email.match(emailRegex)) {
        $($inputMsg).text(emailFormatMsg)
        return false;
    } else {
        return true;
    }
};

/* 
Function: updateDatabase(email, url):
Invoked: By function onSubmit().
Parameters:
    1.  email = the email to add or update.
    2.  url = the url of the current random image.
Purpose:
    1.  Iterate through the database.
    2.  If a match is found, push the url to the images array linked to the current email.
    3.  If a match isn't found, set addObject to true.
    4.  If addObject is true, push a new object containing the email and url to the database.
    5.  Save the modified database to the session storage.
Features:
    1.  If the array has just been initialized with an empty object, the function will
        populate that object with the email and url.
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
Function: checkStatus(response):
Invoked: By function fetchImage().
Parameters:
    1.  response = the response from the fetch attempt.
Purpose:
    1.  Resolve or reject the promise based on the response status.
*/

function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
};

/* 
Function: fetchImage(url):
Invoked: By function loadImage().
Parameters:
    1.  url = the url to fetch.
Purpose:
    1.  Invoke checkStatus(), catch any errors. Return the data.
*/

function fetchImage(url) {
   return fetch(url)
    .then(checkStatus)
    .catch(error => console.log(error));
};

/* 
Function: reloadPage():
Invoked: By function onSubmit().
Purpose: Reload the current page.
*/

function reloadPage() {
    location.reload();
};

/*
Function: tempHideSubmit():
Invoked: On page load.
Purpose: Temporarily hide the submit button while the image loads.
*/

function tempHideSubmit() {
    $($submitBtn).hide().delay(1500).slideDown();
}

/* 
Function: generateImage(image):
Invoked: By function loadImage().
Parameters:
    1.  image = the image url to insert into the source attribute.
Purpose: 
    1.  Build the image tag using the url as the source attribute.
    2.  Insert the image tag.
*/

function generateImage(image) {
    const imageElement = `${imgHTML1}${image}${imgHTML2}`;
    $($imageBox).html(imageElement);
};

// Description needed:

function loadImage() {
    $($imageBox).html(loadingMsg);
    Promise.all([
        fetchImage(url)
    ]).then(data => {
        let randomImage = data[0].url;
        generateImage(randomImage);
    });
};

// Description needed:

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

// Description needed:

function generateResult(email, images) {
    const html = `${resHTML1}${email}${resHTML2}${resultCount}${resHTML3}`;
    $($resultsBox).append(html);
    const resultToTarget = `${$resultImageBox}${resultCount}`;

    for (let i = 0; i < images.length; i++) {
        const img = `${resHTML4}${images[i]}${resHTML5}${i+1}${resHTML6}${email}${resHTML7}`;
        $(resultToTarget).append(img);
    }
};

// Description needed:

function setResultTitle(isAll, email = null,) {
    if (isAll) {
        $($resultsTitle).text(`${resultsPrefix} All`);
    } else {
        $($resultsTitle).text(`${resultsPrefix} ${email}`);
    }
};

// Description needed:

function onRetrieve() {
    $($resultsBox).empty();
    resultCount = 0; 
}

// Description needed:

function retrieveSingle(email) {
    onRetrieve();
    for (let i = 0; i < database.length; i++) {
        if (database[i].email === email) {
            let retrievedEmail = database[i].email;
            let retrievedImages = database[i].images;
            resultCount++;
            setResultTitle(false, retrievedEmail);
            generateResult(retrievedEmail, retrievedImages);
            break;
        }
    }
};

// Description needed:

function retrieveAll() {
    onRetrieve();
    for (let i = 0; i < database.length; i++) {
        let retrievedEmail = database[i].email;
        let retrievedImages = database[i].images;
        resultCount++;
        generateResult(retrievedEmail, retrievedImages);
    }
    setResultTitle(true);
};

// Description needed:

function grabPurifyInput($targetInput) {
    return value = DOMPurify.sanitize (
        $($targetInput).val().trim(), 
        purifyConfig
    );
};

// Description needed:

function search(email, emailValid) {
    if (emailValid) {
        const emailExists = checkEmailExists(email);
        if (emailExists) {
            $($inputMsg).addClass(successMsgClass).text(emailFoundMsg);
            retrieveSingle(email);
        } else {
            $($inputMsg).text(emailNotFoundMsg);
            retrieveAll();
        }
    } else {
        retrieveAll();
    }
};

// Description needed:

function submit(email, emailValid) {
    if (emailValid) {
        $($submitBtn).slideUp();
        const url = $($image).attr('src');
        updateDatabase(email, url);
        $($inputMsg)
            .addClass(successMsgClass)
            .text(submitSuccessMsg
        );
        setTimeout(reloadPage, 2000);
    }
};

// Description needed:

function onSubmit(page, targetElement) {
    const input = grabPurifyInput(targetElement);
    const emailValid = checkEmailValidity(input);
    if (page === 'home') {
        submit(input, emailValid);
    } else if (page === 'search') {
        search(input, emailValid);
    }
};

//------------------------------------------------------------------------------------------------
// GENERAL CODE
//------------------------------------------------------------------------------------------------

// Hide the submit button for 1.5 seconds while image loads:
tempHideSubmit();

// Apply the active nav styles and set isHome:
applyActiveNavStyles(homeURLs, searchURLs);

// If we are on the homepage, invoke loadImage().
// Else we are on the search page, so invoke retrieveAll().
if (isHome) {
    loadImage(); 
} else {
    retrieveAll();
}

// Handler for the submit button:
$($submitBtn).on('click', (event) => {
    event.preventDefault();
    onSubmit('home', $emailField);
});

// Handler for the search button:
$($searchBtn).on('click', (event) => {
    event.preventDefault()
    onSubmit('search', $searchField);
});

// Handler for the reset button:
$($resetBtn).on('click', loadImage);




