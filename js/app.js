// Will store objects containing an email address and the associated image URL.
let emailArray = [];

// Constants used in applyActiveNavStyles():
const homeURLs = ['index.html', ':5500/']; // Holds possible home URL endings
const searchURLs = ['search.html']; // Holds possible search URL endings
const $navLinks = ['#nav__home', '#nav__search']; // Holds the IDs of the two nav links
const activeNavClass = 'active-nav-styles'; // The name of the class to be applied

/* 
Function which applies styles to the current page navigation link.
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
Function which adds a new email and associated image url to emailArray.
email: Email address to associate with image.
image: URL of image to associate with email address.
Wraps values in an object and pushes it to emailArray.
*/ 

function updateEmailArray(email, url) {
    emailArray.push({email: `${email}`, image: `${url}`});
};

/* 
Function that searchs emailArray.
array: the array to search (emailArray).
email: the email to search for.
Returns the entire object if a match is found.
Else logs an error to the console.
*/

function searchEmailArray(array, email) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].email === email) {
            let result = array[i];
            return result;
        } else {
            console.log(`Error: The email address ${email} is not associated with any images!`);
        }
    }
}


// On page load:
$(function () {
    applyActiveNavStyles(homeURLs, searchURLs);
});

