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

function setNavStyles (isHome, className) {
    if (isHome) {
        $($navLinks[0]).addClass(className);
        $($navLinks[1]).removeClass(className);
    } else {
        $($navLinks[1]).addClass(className);
        $($navLinks[0]).removeClass(className);  
    }
};

function setOnHome (isHome) {
    (isHome) ? onHome = true : onHome = false;
};

function reloadPage() {
    location.reload();
};

function tempHideSubmit() {
    $($submitBtn).hide().delay(1500).slideDown();
};

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

function onRetrieve() {
    $($resultsBox).empty();
    resultCount = 0; 
};

function setResultTitle(isAll, email = null,) {
    (isAll) ? title = `${resPrefix} All` : title = `${resPrefix} ${email}`;
    $($resultTitle).text(title);
};

function setInputMsg(isSuccess, msg) {
    if (isSuccess) {
        $($inputMsg).addClass(successMsgClass).text(msg);
    } else {
        $($inputMsg).removeClass(successMsgClass).text(msg);
    }
}

// HTML GENERATION FUNCTIONS

function generateImage(image) {
    const randomImage = `${imgHTML1}${image}${imgHTML2}`;
    $($imageBox).html(randomImage);
};

function generateResult(email, images) {
    const html = `${resHTML1}${email}${resHTML2}${resultCount}${resHTML3}`;
    $($resultsBox).append(html);
    const resultToTarget = `${$resultImageBox}${resultCount}`;

    for (let i = 0; i < images.length; i++) {
        const img = `${resHTML4}${images[i]}${resHTML5}${i+1}${resHTML6}${email}${resHTML7}`;
        $(resultToTarget).append(img);
    }
};

// INPUT AND VALIDATION FUNCTIONS

function grabPurifyInput($targetInput) {
    return value = DOMPurify.sanitize (
        $($targetInput).val().trim(), 
        purifyConfig
    );
};

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

function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
};

function fetchImage(url) {
   return fetch(url)
    .then(checkStatus)
    .catch(error => console.log(error));
};

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

// SEARCH / SUBMIT

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

function submit(email, emailValid) {
    if (emailValid) {
        const url = $($image).attr('src');
        updateDatabase(email, url);
        setInputMsg(true, submitSuccessMsg);
        $($submitBtn).slideUp();
        setTimeout(reloadPage, 1500);
    }
};

function onSubmit(page, targetElement) {
    const input = grabPurifyInput(targetElement);
    const emailValid = getEmailValidity(input);
    (onHome) ? submit(input, emailValid) : search(input, emailValid);
};

//------------------------------------------------------------------------------------------------
// GENERAL CODE
//------------------------------------------------------------------------------------------------

// Hide the submit button for 1.5 seconds while image loads:
tempHideSubmit();

// Apply the active nav styles and set onHome:
detectPage(homeURLs, searchURLs);

// If we are on the homepage, invoke loadImage().
// Else we are on the search page, so invoke retrieveAll().
if (onHome) {
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
$($resetBtn).on('click', () => {
    loadImage();
    tempHideSubmit();
});