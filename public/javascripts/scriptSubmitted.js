var API = {
  getContacts: function() {
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
  },
  getContact: function(id) {
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
  },
  addNewContact: function(jsonObj) {
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
  },
  updateContact: function(id, jsonObj) {
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
  },
  deleteContact: function(id) {
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
  },
}

var App = {
  init: function() {
    this.populateContacts.call(this);
    $("button.addContact").click(this.showAddContactForm.bind(this));
    $("input#search").on("input", this.updateContactsBasedOnSearch.bind(this));
    return this;
  },
  populateContacts: function() {
    API.getContacts()
    .then(this.displayContacts.bind(this))
    .catch(this.handleError.bind(this));
  },
  displayOnePlusContacts: function(data) {
    const contactsFunc = Handlebars.compile($("#contacts").html());
    const contactsHTML = contactsFunc({ contacts: data });
    $("#contactDisplay").empty();
    $("#contactDisplay").removeClass("none");
    $("#contactDisplay").append(contactsHTML);
    $("#contactDisplay").slideDown("medium");
    $(".editContact").click(this.showUpdateContactForm.bind(this));
    $(".deleteContact").click(this.removeContact.bind(this));
  },
  displayZeroContactsReturned: function() {
    $("#contactDisplay").addClass("none");
    $("#contactDisplay").empty();
    $("#contactDisplay").append(`<p>There is no contacts.</p><button class="addContact">Add Contact</button>`);
    $("#contactDisplay").slideDown("medium");
    $("#contactDisplay").find("button.addContact").click(this.showAddContactForm.bind(this));
  },
  displayContacts: function(data) {
    if (data.length > 0){
      this.displayOnePlusContacts.call(this, data);
    } else {
      this.displayZeroContactsReturned.call(this, data);
    }
  }, 
  showUpdateContactForm: function (event) {
    const id = $(event.target).parent("div").attr("id").slice(7);
    event.preventDefault();
  
    API.getContact(id)
    .then((data) => {
      const updateContactFunc = Handlebars.compile($("#contactScript").html());
      const updateContactHTML = updateContactFunc(data);
      $("header").after(updateContactHTML);
      this.updateDisplay.call(this, $("article#mainPage"), $("#contactPage"));
      this.addEventsForUpdatingContact.call(this);
    })
    .catch(this.handleError.bind(this));
  },
  handleError: function(error) { 
    console.log(error); 
  },
  showAddContactForm: function(event){
    event.preventDefault();

    const addContactFunc = Handlebars.compile($("#contactScript").html());
    const addContactHTML = addContactFunc({});
    $("header").after(addContactHTML);
    this.updateDisplay.call(this, $("article#mainPage"), $("#contactPage"));
    this.addEventsForAddingContact.call(this);
  },
  addEventsForAddingContact: function(){
    $("#contactForm").submit(this.submitNewContact.bind(this));

    $("#contactForm button.cancel").click(function(event){
      event.preventDefault();
      this.updateDisplay.call(this, $("article#contactPage"), $("article#mainPage"));
    }.bind(this));
  
    $("#contactForm button.submit").click(function(event){
      event.preventDefault();
      const obj = this.convertFormToObj.call(this, $("#contactForm"));

      if (this.validateContactFormData.call(this, obj)){
        $("#contactForm").trigger("submit");
        this.updateDisplay.call(this, $("article#contactPage"), $("article#mainPage"));
      }
    }.bind(this));
  },
  submitNewContact: function(event){
    event.preventDefault();
    const jsonObj = this.convertFormToObj.call(this, $(event.target));

    API.addNewContact.call(this, jsonObj)
    .then(this.populateContacts.bind(this))
    .catch(this.handleError.bind(this));
  },
  updateDisplay: function($toHide, $toShow){
    $toHide.slideUp("medium", function(){
      $toShow.css("display", "block");
    });
  },
  convertFormToObj: function($form){
    const jsonObj = {};

    $form.serializeArray().forEach(function(obj){
      jsonObj[obj.name] = obj.value;
    });
  
    return jsonObj;
  },
  validateContactFormData: function(obj){
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
  },
  addEventsForUpdatingContact: function(){
    $("#contactForm").submit(this.submitUpdatedContact.bind(this));
  
    $("#contactForm button.cancel").click(function(event){
      event.preventDefault();
      this.updateDisplay.call(this, $("#contactPage"), $("article#mainPage"));
    }.bind(this));
  
    $("#contactForm button.submit").click(function(event){
      event.preventDefault();
  
      const obj = this.convertFormToObj.call(this, $("#contactForm"));
      if (this.validateContactFormData.call(this, obj)){
        $("#contactForm").trigger("submit")
        this.updateDisplay.call(this, $("#contactPage"), $("article#mainPage"));
      }
    }.bind(this));
  },
  submitUpdatedContact: function(event){
    event.preventDefault();
  
    const id = $(event.target).data("id");
    const jsonObj = this.convertFormToObj.call(this, $(event.target));
    jsonObj.id = id;
  
    API.updateContact(id, jsonObj)
    .then(this.populateContacts.bind(this))
    .catch(this.handleError.bind(this));
  },
  updateContactsBasedOnSearch: function(event){
    const inputVal = $(event.target).val().toLowerCase();
  
    const filterBySearch = data => {
      return data.filter(function(contact){
        return contact.full_name.toLowerCase().indexOf(inputVal) !== -1 
            || contact.tags.toLowerCase().split(", ").indexOf(inputVal) !== -1;
      });
    }
  
    const displaySearchedContacts = (data) => {
      if (data.length > 0){
        this.displayOnePlusContacts.call(this, data);
      } else {
        $("#contactDisplay").addClass("none");
        $("#contactDisplay").empty();
        const noContactsFunc = Handlebars.compile($("#noContactMatch").html());
        const noContactsHTML = noContactsFunc({ inputVal: inputVal });
        $("#contactDisplay").append(noContactsHTML);
      }
    }
    
    API.getContacts()
    .then(filterBySearch)
    .then(displaySearchedContacts)
    .catch(this.handleError.bind(this));
  },
  removeContact: function(event){
    if (confirm("Do you want to delete the contact?")){
      const id = $(event.target).parent("div").attr("id").slice(7);
  
      const removeContactFromScreen = () => {
        $(`#contact${id}`).remove();
        if ($("#contactDisplay").children().length === 0) {
          this.displayZeroContactsReturned.call(this);
        }
      }
  
      API.deleteContact(id)
      .then(removeContactFromScreen)
      .catch(this.handleError.bind(this));
    }
  },
}

$(function(){
  const app = Object.create(App).init();
});