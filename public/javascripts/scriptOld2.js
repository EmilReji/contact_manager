const getContacts = () => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: "GET",
      url: "/api/contacts",
      dataType: "json",
      success: function(data, textStatus, jqXHR){
        resolve(data);
      }, 
      error: function(jqXHR, textStatus, errorThrown){
        reject(errorThrown);
      }, 
    });
  });
};

const getContact = (id) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: "GET",
      url: `/api/contacts/${id}`,
      dataType: "json",
      success: function(data, textStatus, jqXHR){
        resolve(data)
      }, 
      error: function(jqXHR, textStatus, errorThrown){
        reject(errorThrown);
      },
    });
  });
};

const addNewContact = (jsonObj) => {
  return new Promise ((resolve, reject) => {
    $.ajax({
      method: "POST",
      url: "/api/contacts",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(jsonObj),
      success: function(data, textStatus, jqXHR){
        resolve(data);
      }, 
      error: function(jqXHR, textStatus, errorThrown){
        reject(errorThrown);
      },
    });
  });
}

const updateContact = (id, jsonObj) => {
  return new Promise ((resolve, reject) => {
    $.ajax({
      method: "PUT",
      url: `/api/contacts/${id}`,
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(jsonObj),
      success: function(data, textStatus, jqXHR){
        resolve(data);
      }, 
      error: function(jqXHR, textStatus, errorThrown){
        reject(errorThrown);
      }, 
    });
  });
}

const deleteContact = (id) => {
  return new Promise ((resolve, reject) => {
    $.ajax({
      method: "DELETE",
      url: `/api/contacts/${id}`,
      success: function(data, textStatus, jqXHR){
        resolve(data);
      }, 
      error: function(jqXHR, textStatus, errorThrown){
        reject(errorThrown);
      },
    });
  });
}

const handleError = error => console.log(error);

const displayContacts = data => {
  if (data.length > 0){
    var contactsFunc = Handlebars.compile($("#contacts").html());
    var contactsHTML = contactsFunc({ contacts: data });
    $("#contactDisplay").empty();
    $("#contactDisplay").removeClass("none");
    $("#contactDisplay").addClass("some");
    $("#contactDisplay").append(contactsHTML);
    $("#contactDisplay").slideDown("medium");
    $(".editContact").click(showUpdateContactForm);
    $(".deleteContact").click(removeContact);
  } else {
    $("#contactDisplay").removeClass("some");
    $("#contactDisplay").addClass("none");
    $("#contactDisplay").empty();
    $("#contactDisplay").append(`<p>There is no contacts.</p><button class="addContact">Add Contact</button>`);
    $("#contactDisplay").find("button.addContact").click(showAddContactForm);
  }
} 

function populateContacts(){
  getContacts().then(displayContacts).catch(handleError);
}

function showAddContactForm(event){
  event.preventDefault();

  var addContactFunc = Handlebars.compile($("#addContactScript").html());
  var addContactHTML = addContactFunc({});
  $("header").after(addContactHTML);
  $("article#mainPage").slideUp("medium", function(){
    $("#addContactPage").css("display", "block");
  });

  addEventsForAddingContact();
}

function validateNewContactForm(obj){
  var status = true;

  $("#addContactForm p.errorMsg").remove();
  $("#updateContactForm p.errorMsg").remove();

  Object.keys(obj).forEach(function(key){
    var val = obj[key];
    var $element = $(`#${key}`);
    $element.removeClass("error");

    if (val.trim() === "" && $element.attr("required")){
      status = false;
      $element.addClass("error");
      $element.after(`<p class="errorMsg">Please enter the valid ${key} field.</p>`)
    }
  });

  return status;
}

function getFormObj($form){
  var jsonObj = {};

  $form.serializeArray().forEach(function(obj){
    jsonObj[obj.name] = obj.value;
  });

  return jsonObj;
}

function submitNewContact(event){
  event.preventDefault();
  var jsonObj = getFormObj($(event.target));

  addNewContact(jsonObj).then(populateContacts).catch(handleError);
}

function addEventsForAddingContact(){
  $("#addContactForm").submit(submitNewContact);

  $("#addContactForm button.cancel").click(function(event){
    event.preventDefault();

    $("article#addContactPage").slideUp("medium", function(){
      $("article#mainPage").css("display", "block");
    });
  });

  $("#addContactForm button.submit").click(function(event){
    event.preventDefault();

    var obj = getFormObj($("#addContactForm"));
    if (validateNewContactForm(obj)){
      $("#addContactForm").trigger("submit");

      $("article#addContactPage").slideUp("medium", function(){
        $("article#mainPage").css("display", "block");
      });
    }
  });
}

function submitUpdatedContact(event){
  event.preventDefault();

  var id = $(event.target).data("id");
  var jsonObj = getFormObj($(event.target));
  jsonObj.id = id;

  updateContact(id, jsonObj).then(populateContacts).catch(handleError);
}


function addEventsForUpdatingContact(){
  $("#updateContactForm").submit(submitUpdatedContact);

  $("#updateContactForm button.cancel").click(function(event){
    event.preventDefault();
    $("article#updateContactPage").remove();
    $("article#mainPage").css("display", "block");
  });

  $("#updateContactForm button.submit").click(function(event){
    event.preventDefault();

    var obj = getFormObj($("#updateContactForm"));
    if (validateNewContactForm(obj)){
      $("#updateContactForm").trigger("submit")
      $("article#updateContactPage").remove();
      $("article#mainPage").css("display", "block");
    }
  });
}


function showUpdateContactForm(event){
  var id = $(event.target).parent("div").attr("id").slice(7);
  event.preventDefault();

  getContact(id).then((data) => {
    $("article#mainPage").css("display", "none");
    var updateContactFunc = Handlebars.compile($("#updateContactScript").html());
    var updateContactHTML = updateContactFunc(data);
    $("header").after(updateContactHTML);

    addEventsForUpdatingContact();
  }).catch(handleError);
}

function removeContact(event){
  if (confirm("Do you want to delete the contact?")){
    var id = $(event.target).parent("div").attr("id").slice(7);
    deleteContact(id).then(populateContacts).catch(handleError);
  }
}

function updateContactsBasedOnSearch(event){
  const inputVal = $(event.target).val();

  const filterBy = data => {
    return data.filter(function(contact){
      return contact.full_name.indexOf(inputVal) !== -1;
    });
  }

  const displayUpdatedContacts = (data) => {
    if (data.length > 0){
      var contactsFunc = Handlebars.compile($("#contacts").html());
      var contactsHTML = contactsFunc({ contacts: data });
      $("#contactDisplay").empty();
      $("#contactDisplay").removeClass("none");
      $("#contactDisplay").addClass("some");
      $("#contactDisplay").append(contactsHTML);
      $(".editContact").click(showUpdateContactForm);
      $(".deleteContact").click(removeContact);
    } else {
      $("#contactDisplay").removeClass("some");
      $("#contactDisplay").addClass("none");
      $("#contactDisplay").empty();
      var noContactsFunc = Handlebars.compile($("#noContactMatch").html());
      var noContactsHTML = noContactsFunc({ inputVal: inputVal });
      $("#contactDisplay").append(noContactsHTML);
    }
  }
  
  getContacts().then(filterBy).then(displayUpdatedContacts).catch(handleError);
}

$(function(){
  populateContacts();
  $("button.addContact").click(showAddContactForm);
  $("input#search").on("input", updateContactsBasedOnSearch)
});



/*
Refactoring Plan:
First create standlone methods to handle API calls; use promises? fetch API?; Use promises with jQuery's $.ajax
- Send GET to /api/contacts to get all contacts back in JSON; need to do twice (for populate and for search)
- Send POST to /api/contacts with JSON data to get back JSON
- Send PUT to /api/contacts/${id} with JSON data to get back JSON
- Send GET to /api/contacts/${id} to get a contact back in JSON
- Send DELETE to /api/contacts/${id}; no JSON

Plan:
- A get all contacts method -- done
- A seperate filter method to be run when we only want a subset of all contacts
- An add contact method
- An update contat method
- A get individual contact method -- done 
- A delete contact method


When clicking adding contact; runs showAddContactForm on 110; runs addEventsForAddingContact on 161 

Later:
Then refactor current code to use those; commit at this point
Figure out how to make adding new contact and updating existing contact into one piece of code; commit;
Then figure out how to put everything into objects with methods
*/