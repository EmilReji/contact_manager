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

const updateDisplay = ($toHide, toShow) => {
  $toHide.slideUp("medium", function(){
    toShow.css("display", "block");
  });
}

const displayOnePlusContacts = data => {
  const contactsFunc = Handlebars.compile($("#contacts").html());
  const contactsHTML = contactsFunc({ contacts: data });
  $("#contactDisplay").empty();
  $("#contactDisplay").removeClass("none");
  $("#contactDisplay").append(contactsHTML);
  $("#contactDisplay").slideDown("medium");
  $(".editContact").click(showUpdateContactForm);
  $(".deleteContact").click(removeContact);
}

const displayZeroContactsReturned = () => {
  $("#contactDisplay").addClass("none");
  $("#contactDisplay").empty();
  $("#contactDisplay").append(`<p>There is no contacts.</p><button class="addContact">Add Contact</button>`);
  $("#contactDisplay").slideDown("medium");
  $("#contactDisplay").find("button.addContact").click(showAddContactForm);
}

const displayContacts = data => {
  if (data.length > 0){
    displayOnePlusContacts(data);
  } else {
    displayZeroContactsReturned();
  }
} 

const populateContacts = () => {
  getContacts().then(displayContacts).catch(handleError);
}

const showAddContactForm = (event) => {
  event.preventDefault();

  const addContactFunc = Handlebars.compile($("#contactScript").html());
  const addContactHTML = addContactFunc({});
  $("header").after(addContactHTML);
  updateDisplay($("article#mainPage"), $("#contactPage"))
  addEventsForAddingContact();
}

const validateContactFormData = (obj) => {
  let status = true;

  $("#contactForm p.errorMsg").remove();

  Object.keys(obj).forEach(function(key){
    let val = obj[key];
    let $element = $(`#${key}`);
    $element.removeClass("error");

    if (val.trim() === "" && $element.attr("required")){
      status = false;
      $element.addClass("error");
      $element.after(`<p class="errorMsg">Please enter the valid ${key} field.</p>`)
    }
  });

  return status;
}

const convertFormToObj = ($form) => {
  const jsonObj = {};

  $form.serializeArray().forEach(function(obj){
    jsonObj[obj.name] = obj.value;
  });

  return jsonObj;
}

const submitNewContact = (event) => {
  event.preventDefault();
  const jsonObj = convertFormToObj($(event.target));

  addNewContact(jsonObj).then(populateContacts).catch(handleError);
}

const addEventsForAddingContact = () => {
  $("#contactForm").submit(submitNewContact);

  $("#contactForm button.cancel").click(function(event){
    event.preventDefault();
    updateDisplay($("article#contactPage"), $("article#mainPage"));
  });

  $("#contactForm button.submit").click(function(event){
    event.preventDefault();

    const obj = convertFormToObj($("#contactForm"));
    if (validateContactFormData(obj)){
      $("#contactForm").trigger("submit");
      updateDisplay($("article#contactPage"), $("article#mainPage"));
    }
  });
}

const submitUpdatedContact = (event) => {
  event.preventDefault();

  const id = $(event.target).data("id");
  const jsonObj = convertFormToObj($(event.target));
  jsonObj.id = id;

  updateContact(id, jsonObj).then(populateContacts).catch(handleError);
}


const addEventsForUpdatingContact = () => {
  $("#contactForm").submit(submitUpdatedContact);

  $("#contactForm button.cancel").click(function(event){
    event.preventDefault();
    updateDisplay($("#contactPage"), $("article#mainPage"));
  });

  $("#contactForm button.submit").click(function(event){
    event.preventDefault();

    const obj = convertFormToObj($("#contactForm"));
    if (validateContactFormData(obj)){
      $("#contactForm").trigger("submit")
      updateDisplay($("#contactPage"), $("article#mainPage"));
    }
  });
}


const showUpdateContactForm = (event) => {
  const id = $(event.target).parent("div").attr("id").slice(7);
  event.preventDefault();

  getContact(id).then((data) => {
    const updateContactFunc = Handlebars.compile($("#contactScript").html());
    const updateContactHTML = updateContactFunc(data);
    $("header").after(updateContactHTML);
    updateDisplay($("article#mainPage"), $("#contactPage"));
    addEventsForUpdatingContact();
  }).catch(handleError);
}


const removeContact = (event) => {
  if (confirm("Do you want to delete the contact?")){
    const id = $(event.target).parent("div").attr("id").slice(7);

    const removeContactFromScreen = () => {
      $(`#contact${id}`).remove();
      if ($("#contactDisplay").children().length === 0) {
        displayZeroContactsReturned();
      }
    }

    deleteContact(id).then(removeContactFromScreen).catch(handleError);
  }
}

const updateContactsBasedOnSearch = (event) => {
  const inputVal = $(event.target).val().toLowerCase();

  const filterBySearch = data => {
    return data.filter(function(contact){
      return contact.full_name.toLowerCase().indexOf(inputVal) !== -1 
          || contact.tags.toLowerCase().split(", ").indexOf(inputVal) !== -1;
    });
  }

  const displaySearchedContacts = (data) => {
    if (data.length > 0){
      displayOnePlusContacts(data);
    } else {
      $("#contactDisplay").addClass("none");
      $("#contactDisplay").empty();
      const noContactsFunc = Handlebars.compile($("#noContactMatch").html());
      const noContactsHTML = noContactsFunc({ inputVal: inputVal });
      $("#contactDisplay").append(noContactsHTML);
    }
  }
  
  getContacts().then(filterBySearch).then(displaySearchedContacts).catch(handleError);
}

$(function(){
  populateContacts();
  $("button.addContact").click(showAddContactForm);
  $("input#search").on("input", updateContactsBasedOnSearch)
});