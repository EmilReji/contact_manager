const API = {
  getContacts: function() {
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

const Tags = {
  seperator: ",",
  init: function(tagArr){
    this.tags = tagArr;
    return this;
  },
  getTagString: function(){
    return this.tags.join(this.seperator)
  },
  getTagArr: function(){
    return this.tags;
  },
  setTagsWithTagArr(tagArr){
    this.tags = tagArr;
  },
  setTagsWithTagStr(tagString){
    this.tags = this.generateTagArr(tagString);
  },
  generateTagArr: function(tagString){
    tagString = tagString.replace(/\s/g, '');
    return tagString.split(this.seperator);
  },
  includesTag(tag){
    return this.tags.includes(tag);
  },
  addTag(tag){
    if (/s/.test(tag)) {
      this.tags.push(tag);
      // need to make http request to send PUT; will probably do in Contact
    } else {
      throw `The tag of "${tag}" contains whitespace.`;
    }
  },
  removeTag(tag){
    const idxToRemove = this.tags.indexOf(tag);
    if (idxToRemove >= 0){
      this.tags.splice(idxToRemove, 1);
      // need to make http request to send PUT; will probably do in Contact
    } else {
      throw `The tag of "${tag}" doesn't exist.`;
    }
  }
}

const Contact = {
  init: function(contactObj){
    this.id = contactObj.id;
    this.full_name = contactObj.full_name;
    this.email = contactObj.email;
    this.phone_number = contactObj.phone_number;
    this.tags = Object.create(Tags).init(contactObj.tags);
    return this;
  },
  // pullChangesFromAPI: function(){
  //   API.getContact(this.id).then(this.init);
  // },
  // pushChangesToAPI: function(){
    
  // },
}

const Contacts = {
  init: function(){
    return this;
  }, 
  getData: function(){
    return new Promise((resolve, reject) => {
      resolve(API.getContacts().then(this.populateArr.bind(this)));
    });
  },
  populateArr: function(data){
    data = data.map(contactObj => {
      return Object.create(Contact).init(contactObj);
    });

    this.data = data;
    return this;
  },
}

const App = {
  contacts: "testval",
  init: function() {
    const contactsObj = Object.create(Contacts).init(); // 
    contactsObj.getData().then(function(_){ 
      console.log("inside then");
      this.contacts = contactsObj.data; 
      console.log(Object.getPrototypeOf(this)); // {contacts: "testval", init: ƒ, test: ƒ}
      console.log(this); // has contacts property with array of 5 items; however slightly different view than in App.test
      // {contacts: Array(5)} contacts: (5) [{…}, {…}, {…}, {…}, {…}] __proto__: Object
      console.log(this.contacts); // has array
      console.log("inside then");
    }.bind(this)).then(this.test.bind(this));
    return this;
  },
  test: function(){
    console.log("testing using test method on App");
    console.log(Object.getPrototypeOf(this)); // {contacts: "testval", init: ƒ, test: ƒ}
    console.log(this); // has contacts property with array of 5 items; ex. {} contacts: (5) [{…}, {…}, {…}, {…}, {…}] __proto__: Object
    console.log(this.contacts); // testval; no array
    console.log("testing using test method on App");
  }
}

$(function(){
  var app = Object.create(App).init(); 
  // app.test(); if this is run here instead of running as argument passed to then in init, will get result shown in comments next to test
});

// if run in console (after everything is ready) or run inside document ready function
// console.log("window test");
// console.log(this.contacts); // shows script with id of contacts
// console.log("window test");


