// Will store objects containing an email address and the associated image URL.

var emailArray = [];

if (sessionStorage.getItem('emailArray') === null) {
    emailArray.push({email: '', images: []});
    console.log(emailArray);
} else {
    emailArray = JSON.parse(sessionStorage.getItem('emailArray'));
    console.log(emailArray);
}

// Constants used in applyActiveNavStyles():
const homeURLs = ['index.html', ':5500/']; // Holds possible home URL endings
const searchURLs = ['search.html']; // Holds possible search URL endings
const $navLinks = ['#nav__home', '#nav__search']; // Holds the IDs of the two nav links
const activeNavClass = 'active-nav-styles'; // The name of the class to be applied

const $image = '#theImage';

const url = 'https://picsum.photos/1920'



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


function updateEmailArray(array, email, url) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].email === '') {
            emailArray[i].email = email;
            emailArray[i].images.push(url);
        } else if (array[i].email === email) {
            emailArray[i].images.push(url);
        } else {
            emailArray.push({email: `${email}`, images: [`${url}`]});
        }
    }
    sessionStorage.setItem('emailArray', JSON.stringify(emailArray));
}

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

function fetchImage(url) {
   return fetch(url)
    .then(checkStatus)
    .catch(error => console.log(error));
}

function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

function generateImage(image) {
    $($image).attr('src', image);
}


// On page load:
$(function () {
    applyActiveNavStyles(homeURLs, searchURLs);
});

Promise.all([
    fetchImage(url)
]).then(data => {
    const randomImage = data[0].url;
    generateImage(randomImage);
})

updateEmailArray(emailArray, 'test2@example.com', 'https://i.picsum.photos/id/641/1920/1920.jpg?hmac=07v0Mrggv_hPogT_x-YTf0zuH9oK2N2x4OxmziaxlGA');
console.log(emailArray);