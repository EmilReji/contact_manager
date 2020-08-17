function populateContacts(){
  $.ajax({
    method: "GET",
    url: "/api/contacts",
    dataType: "json",
    success: function(data, textStatus, jqXHR){
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
    }, 
    error: function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
    }, 
    complete: function(jqXHR, textStatus){
      // console.log(jqXHR);
      // console.log(textStatus);
    }
  });
}

function showAddContactForm(event){
  event.preventDefault();

  // $("article#mainPage").css("display", "none");
  var addContactFunc = Handlebars.compile($("#addContactScript").html());
  var addContactHTML = addContactFunc({});
  $("header").after(addContactHTML);
  $("article#mainPage").slideUp("medium", function(){
    $("#addContactPage").css("display", "block");
  });
  // $("#addContactPage").css("display", "block");
  // $("#addContactPage").slideDown("medium");

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

  $.ajax({
    method: "POST",
    url: "/api/contacts",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(jsonObj),
    success: function(data, textStatus, jqXHR){
      populateContacts();
    }, 
    error: function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
    }, 
    complete: function(jqXHR, textStatus){
      // console.log(jqXHR);
      // console.log(textStatus);
    }
  });
}

function addEventsForAddingContact(){
  $("#addContactForm").submit(submitNewContact);

  $("#addContactForm button.cancel").click(function(event){
    event.preventDefault();
    // $("article#addContactPage").remove();
    // $("article#mainPage").css("display", "block");
    // $("article#mainPage").slideDown("medium");

    $("article#addContactPage").slideUp("medium", function(){
      $("article#mainPage").css("display", "block");
    });
  });

  $("#addContactForm button.submit").click(function(event){
    event.preventDefault();

    var obj = getFormObj($("#addContactForm"));
    if (validateNewContactForm(obj)){
      $("#addContactForm").trigger("submit")
      // $("article#addContactPage").remove();
      // $("article#mainPage").css("display", "block");
      // $("article#mainPage").slideDown("medium");

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
  console.log(jsonObj);

  $.ajax({
    method: "PUT",
    url: `/api/contacts/${id}`,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(jsonObj),
    success: function(data, textStatus, jqXHR){
      console.log(data);
      populateContacts();
    }, 
    error: function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
    }, 
    complete: function(jqXHR, textStatus){
      console.log(jqXHR);
      console.log(textStatus);
    }
  });
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

  $.ajax({
    method: "GET",
    url: `/api/contacts/${id}`,
    dataType: "json",
    success: function(data, textStatus, jqXHR){
      $("article#mainPage").css("display", "none");
      var updateContactFunc = Handlebars.compile($("#updateContactScript").html());
      var updateContactHTML = updateContactFunc(data);
      $("header").after(updateContactHTML);

      addEventsForUpdatingContact();
    }, 
    error: function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
    }, 
    complete: function(jqXHR, textStatus){
      // console.log(jqXHR);
      // console.log(textStatus);
    }
  });
}

function removeContact(event){
  if (confirm("Do you want to delete the contact?")){
    var id = $(event.target).parent("div").attr("id").slice(7);
    console.log(id);
    $.ajax({
      method: "DELETE",
      url: `http://localhost:3000/api/contacts/${id}`,
      success: function(data, textStatus, jqXHR){
        console.log(data);
        populateContacts();
      }, 
      error: function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);
      }, 
      complete: function(jqXHR, textStatus){
        console.log(jqXHR);
        console.log(textStatus);
      }
    });
  }
}

function updateContactsBasedOnSearch(event){
  var inputVal = $(event.target).val();
  $.ajax({
    method: "GET",
    url: "/api/contacts",
    dataType: "json",
    success: function(data, textStatus, jqXHR){
      data = data.filter(function(contact){
        return contact.full_name.indexOf(inputVal) !== -1;
      });

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
    }, 
    error: function(jqXHR, textStatus, errorThrown){
      console.log(errorThrown);
    }, 
    complete: function(jqXHR, textStatus){
      // console.log(jqXHR);
      // console.log(textStatus);
    }
  });
}

$(function(){
  populateContacts();
  $("button.addContact").click(showAddContactForm);
  $("input#search").on("input", updateContactsBasedOnSearch)
});