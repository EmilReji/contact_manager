# Contact Manager App README.md

## Summary
This app is a visual and functional replication of [this](http://devsaran.github.io/contact-manager-backbone/) application. Note that the technologies used are different in my version than the template version (see section below).

## What was used:
- I used jQuery for the DOM related interactions
- I used Handlebars for the HTML templating when applicable
- I used Promises combined with jQuery's $.ajax method to make HTTP requests to the API

## High Level Code Structure:
- There are two major objects
- The `API` object contains methods that make HTTP requests using jQuery's `$.ajax` method
- Each of them return `Promise` objects
- The second object is `App` and contains all the methods related to the actual app functionality
- `App` depends on the `API` object's methods to get data from our provided API
- In order to start the application, the App object's `init` object must be run
- Since we are using the OLOO format, the App object is passed into `Object.create` before init is run
- The return value is stored in the variable `app` in case it is needed later (current structure of app,ication doesn't require this)
- This initialization is put inside the document ready function so it is only run after the DOM is loaded
- Note that the `API` and `App` objects are kept outside of the document ready function

## High Level App Code Structure
- The `init` method starts by calling the `populateContacts` method which gets all the contacts and displays them to the screen
- `populateContacts` is used in multiple other places since it serves as a good way to "refresh" the page's data (such as after an update to a contact) without having to refresh the entire page
- `populateContacts` (along with a few other methods) shows the benefit of using Promises in our API object since we can simply invoke `then` and/or `catch` as needed and pass in the function to be run
- The `init` method then adds event listeners for the add contact button along with the search input
- The functions passed into the event listeners will then call other methods as well
- For example, when the button to add contacts is clicked, the `showAddContactForm` method is run
- This method will handle the displaying of the contact form (and hiding of the contact list and other buttons) before invoking the `addEventsForAddingContact` method
- This method will add the event listeners to the submit and cancel buttons
- There are also other helper methods used such as `updateDisplay` which handles the sliding in/out of certain elements, `convertFormToObj` which takes a form's key value pairs and converts to a JS object, and `validateContactFormData` which checks if the required fields have valid values or not
- Note that error handling for the promises is done by adding `catch(handleError)` at the end of every chain
- `handleError` simply outputs the error to the console
- However it can be expanded on easily if needed

## Adding a new contact vs updating an existing contact
- The goal for both in the solution app was similar in that they both used identical forms
- The primary difference is that adding a new contact uses an empty form and sends a POST
- Meanwhile updating an existing contact takes an existing contacts data, populates the form, and sends a PUT request when submitted
- Becuase the front-end is similar, I used a single Handlebar's template (id of contactScript) for both situations
- It is used by `1`showAddContactForm` and `showUpdateContactForm` methods
- Both methods use the template to generate the form before invoking `addEventsForAddingContact` or `addEventsForUpdatingContact` respectively
- Those two add the event listeners for submit and cancel
- Despite there being many similarities in these methods, I didn't try to extract out the similarities beyond what I have now because there are enough subtle differences that would confuse the process
- For instance, updating a contact requires finding and using the id of the contact involved while adding a contact doesn't need that functionality all

## Why isn't there a bindEvents method of some sort?
- I considered adding a method called `bindEvents` which would add all event listeners needed for our application at the time of initialization
- However because of the fact that the event listeners on a page will change dramatically depending on what we navigated to (home page with all contacts vs new contact vs edit contact), I ended up adding event listeners whenever needed instead
- I suppose I could have created a common parent element and tried to add event listeners to that; aka using event delegation
- As long as this common parent element was part of every potential view, it would theoretically handle any event
- However, I believe the code for it would end up more complex than what I have now

## Potential Updates for Future
- Right now, deleting a contact doesn't make an addtional HTTP request beyond the DELETE
- In order to update the screen, it manually finds the deleted element on the DOM and removes it
- This is less work than simply invoking `populateContacts` to refresh the data without refershing the screen
- On the other hand, updating a contact involves making a GET request for a specific contact to populate the form, then sending the PUT when submit is clicked, and finally invoking `populateContacts` which sends a POST to get all contacts
- The initial GET could probably be replaced with a helper method that gathers the current contact data from the screen of all contacts
- The final invocation of `populateContacts` could also be replaced with a manual update to the contacts screen via DOM manipulation


- Every time the search input's value is changed (or `populateContacts` is invoked elsewhere), a POST request must be made to get all contacts
- As the number of contacts gets bigger, it seems likely that this process would be slower, especially if our app was built to handle multiple users with different sets of contacts
- Maybe some form of caching can help here?
