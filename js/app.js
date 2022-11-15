let emailArray = [];



emailArray.push({email: 'test2@example.com', image: 'this is another image url'});

function updateEmailArray(email, url) {
    emailArray.push({email: `${email}`, image: `${url}`});
}

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

let result = searchEmailArray(emailArray, 'test@example.com');

if (result) {
    console.log(result.image);
}
