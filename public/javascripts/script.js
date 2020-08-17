var API = {
  getContacts: function(callback) {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: "/api/contacts",
        dataType: "json",
        success: function(data, textStatus, jqXHR){
          data.forEach((contact) => {
            contact.tags = contact.tags.split(', ');
          }); // TO UPDATE
          
          resolve(data);
        }, 
        error: function(jqXHR, textStatus, errorThrown){
          reject(errorThrown);
        }, 
      });
    }).then(callback);
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
  addNewContact: function(jsonObj, callback) {
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
    }).then(callback);
  },
  updateContact: function(id, jsonObj, callback) {
    new Promise ((resolve, reject) => {
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
    }).then(callback);
  },
  deleteContact: function(id, callback) {
    new Promise ((resolve, reject) => {
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
    }).then(callback);
  },
}

const Contact = {
  init: function(contactObj){
    this.id = contactObj.id;
    this.full_name = contactObj.full_name;
    this.email = contactObj.email;
    this.phone_number = contactObj.phone_number;
    this.tags = contactObj.tags;

    return this;
  },
  updateContact(jsonObj){
    this.full_name = jsonObj.full_name;
    this.email = jsonObj.email;
    this.phone_number = jsonObj.phone_number;
    this.tags = jsonObj.tags;
  },
}

const Contacts = {
  init: function(callback){
    API.getContacts((data) => {
      this.data = {};
      data.forEach(contactObj => {
        this.data[contactObj.id] = Object.create(Contact).init(contactObj);
      });
    }).then(callback);
  }, 
  getObjects: function(){
    return _.cloneDeep(this.data); // lodash deep clone
  },
  getMatchingObjects: function(inputVal){
    inputVal = inputVal.toLowerCase();

    return Object.values(_.cloneDeep(this.data)).filter((contact) => {
      return contact.full_name.toLowerCase().indexOf(inputVal) !== -1 
          || contact.tags.map(tag => tag.toLowerCase()).indexOf(inputVal) !== -1;
    });
  },
  getContact: function(id){
    return _.cloneDeep(this.data[id]); // lodash deep clone
  },
  updateContact: function(id, jsonObj, callback){
    const contact = this.data[id];
    contact.updateContact(jsonObj);
    API.updateContact(id, jsonObj, callback);
  },
  deleteContact: function(id, callback){
    delete this.data[id];
    API.deleteContact(id, callback);
  },
  addContact: function(jsonObj, callback){
    API.addNewContact(jsonObj, (contact) => {
      const newId = contact.id;
      jsonObj.id = newId;
      this.data[newId] = Object.create(Contact).init(jsonObj);
    }).then(callback);
  },
  handleError: function(error){
    console.log(error)
  }
}

const App = {
  init: function(){
    Contacts.init(() => { this.populateContacts(Contacts.getObjects()) });
  },
  unbindEvents: function(){
    $(".editContact").unbind("click");
    $(".deleteContact").unbind("click");
    $("button.addContact").unbind("click");
    $("input#search").unbind("input");
  },
  populateContacts: function(contacts){
    const numContacts = Object.keys(contacts).length;

    if (numContacts > 0){
      const contactsTempFunc = Handlebars.compile($("#contacts").html());
      const contactsHTML = contactsTempFunc({ "contacts": contacts });

      $("#contactDisplay").empty();
      $("#contactDisplay").removeClass("none");
      $("#contactDisplay").append(contactsHTML);
      $("#contactDisplay").slideDown("medium");

      this.unbindEvents.call(this);
      $(".editContact").click(this.showUpdateContactForm.bind(this));
      $(".deleteContact").click(this.removeContact.bind(this));
      $("button.addContact").click(this.showAddContactForm.bind(this));
      $("span.tag").click(this.changeTagVal.bind(this));
    } else {
      this.displayZeroContactsReturned.call(this);
    }

    $("input#search").on("input", this.updateContactsBasedOnSearch.bind(this));
  },
  displayZeroContactsReturned: function() {
    $("#contactDisplay").empty();
    $("#contactDisplay").addClass("none");
    $("#contactDisplay").append(`<p>There is no contacts.</p><button class="addContact">Add Contact</button>`);
    $("#contactDisplay").slideDown("medium");
    $("#contactDisplay").find("button.addContact").click(this.showAddContactForm.bind(this)); // add later
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

    Contacts.addContact(jsonObj, App.init.bind(App));
  },
  showUpdateContactForm: function (event) {
    event.preventDefault();

    const id = $(event.target).parent("div").attr("id").slice(7);
    const contactData = Contacts.getContact(id);

    const updateContactFunc = Handlebars.compile($("#contactScript").html());
    const updateContactHTML = updateContactFunc(contactData);
    $("header").after(updateContactHTML);
    this.updateDisplay.call(this, $("article#mainPage"), $("#contactPage"));
    this.addEventsForUpdatingContact.call(this);
  },
  updateDisplay: function($toHide, $toShow){
    $toHide.slideUp("medium", function(){
      $toShow.css("display", "block");
    });
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

    Contacts.updateContact(id, jsonObj, App.init.bind(App));
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
  convertFormToObj: function($form){
    const jsonObj = {};

    $form.serializeArray().forEach(function(obj){
      jsonObj[obj.name] = obj.value;
    });
  
    return jsonObj;
  },
  removeContact: function(event){
    if (confirm("Do you want to delete the contact?")){
      const id = $(event.target).parent("div").attr("id").slice(7);

      Contacts.deleteContact(id, () => {
        $(`#contact${id}`).remove();
        if ($("#contactDisplay").children().length === 0) {
          this.displayZeroContactsReturned.call(this);
        }
      })
    }
  },
  updateContactsBasedOnSearch: function(event){
    const inputVal = $(event.target).val().toLowerCase();
    const matchingContacts = Contacts.getMatchingObjects(inputVal);

    if (matchingContacts.length > 0){
      this.populateContacts.call(this, matchingContacts);
    } else {
      $("#contactDisplay").addClass("none");
      $("#contactDisplay").empty();
      const noContactsFunc = Handlebars.compile($("#noContactMatch").html());
      const noContactsHTML = noContactsFunc({ inputVal: inputVal });
      $("#contactDisplay").append(noContactsHTML);
    }
  },
  changeTagVal: function(event){
    const tag = $(event.target).text();
    $("input#search").val(tag);
    $("input#search").trigger("input");
  }
}

$(function(){
  App.init();
});