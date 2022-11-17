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
const emailNotFoundMsg = "Match not found!";
const emailFoundMsg = "Match found!";
const showingAllMsg = "Showing results for: All";

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
                    console.log(`Error: Cannot determine active link for ${currentURL}`);
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
    1.  Perform checks on the email. 
    2.  Set the text of $inputMsg if email isn't valid.
    2.  Return true if email is valid, false if not.
Features:
    1.  Removes the successMsgClass as a precautionary measure.
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
Function fetchImage(url);
Invoked on page load.
url = the predefined API url (global constant).
Invokes checkStatus(), catch any errors. Returns the data object.
*/

function fetchImage(url) {
   return fetch(url)
    .then(checkStatus)
    .catch(error => console.log(error));
};

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
};

// Function reloadPage(). Self explanatory.

function reloadPage() {
    location.reload();
};

/* 
Function generateImage(image);
Invoked on page load.
image = the url of the random image url returned by the fetch call.
Sets the source attribute of the image elemtent.
*/

function generateImage(image) {
    let imageElement = `<img id='image__img' src='${image}' alt='A random image'>`;
    $($imageBox).html(imageElement);
};

/* 
Function onSubmit(event);
Invoked by $submitBtn click handler.
event = the event passed by the click handler.
1. Prevents the default action.
2. Grabs and sanitizes the value of $emailField.
3. Invokes checkEmail, passing in the sanitized email and 
    assigning the return value to emailValid.
4. If emailValid is true, grab the current image url and invoke updateDatabase(),
    passing in the email and the url of the current image.
*/



function loadImage() {
    $($submitBtn).slideUp();
    $($imageBox).html(loadingMsg);

    Promise.all([
        fetchImage(url)
    ]).then(data => {
        let randomImage = data[0].url;
        generateImage(randomImage);
    });
    $($submitBtn).delay(1000).slideDown();
};

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
}

function emptyResults() {
    $($resultsBox).empty();
}


function generateResult(email, images) {
    const html = 
    `<div class="results__item">
        <h3 class="results__email">${email}</h3>
        <div class="results__img__box rib${resultCount}">
        </div>
    </div>`;

    $($resultsBox).append(html);

    let resultToTarget = `${$resultImageBox}${resultCount}`;

    for (let i = 0; i < images.length; i++) {
        const img = `<img class="results__image" src="${images[i]}" alt="Image #${i + 1} from ${email}">`;
        $(resultToTarget).append(img);
    }
}

function setResultTitle(isAll, email = null,) {
    if (isAll) {
        $($resultsTitle).text(showingAllMsg);
    } else {
        $($resultsTitle).text(`Showing result for: ${email}`);
    }
}

function retrieveSingle(email) {
    emptyResults();
    resultCount = 0;
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
}

function retrieveAll() {
    emptyResults();
    resultCount = 0;
    for (let i = 0; i < database.length; i++) {
        let retrievedEmail = database[i].email;
        let retrievedImages = database[i].images;
        resultCount++;
        generateResult(retrievedEmail, retrievedImages);
    }
    setResultTitle(true);
}

function grabPurifyInput($targetInput) {
    return value = DOMPurify.sanitize (
        $($targetInput).val().trim(), 
        purifyConfig
    );
}

function onSubmit(event) {
    event.preventDefault();
    const email = grabPurifyInput($emailField);
    const emailValid = checkEmailValidity(email);

    if (emailValid) {
        $($submitBtn).slideUp();
        const url = $($image).attr('src');
        updateDatabase(email, url);
        $($inputMsg)
            .addClass(successMsgClass)
            .text("Successfully linked image to email!"
        );
        setTimeout(reloadPage, 2000);
    }
};


function onSearch(event) {
    event.preventDefault();
    const email = grabPurifyInput($searchField);
    const emailValid = checkEmailValidity(email);

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

/*
FUNCTIONS END
----------------------------------------------------------------
GENERAL CODE START
*/

// Hide the submit button by default:
$($submitBtn).hide();

// Apply the active nav styles:
applyActiveNavStyles(homeURLs, searchURLs);


if (isHome) {
    loadImage(); 
} else {
    retrieveAll();
}




// Handler for the submit button
$($submitBtn).on('click', (event) => onSubmit(event));

$($resetBtn).on('click', loadImage);

$($searchBtn).on('click', (event) => onSearch(event));


