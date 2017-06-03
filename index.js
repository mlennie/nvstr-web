var citiesOutOfRange = [], citiesInRange = [], cities = [];

function serialize() {
  var data = {},inputs,c,i;
  inputs = [].slice.call(document.forms[0].getElementsByTagName('input'));
  for (i = 0; i < inputs.length; i++) {
    data[inputs[i].name] = inputs[i].value;
  }
  return data;
}

function dataValid(data) {
  return data &&
         data.min && +data.min != NaN &&
         data.max && +data.max != NaN && +data.max > +data.min &&
         data.name && data.name.length > 2;
}

function refreshTable() {
  var html,city,min,max,currentTemp;
  var table = document.getElementById("table-body");
  table.innerHTML = "";
  for (var i = 0; i < cities.length; i++) {
    html = "";
    city = cities[i];
    inRange = city.in_range;
    name = "<td>" + city.name + "</td>";
    min = "<td>" + city.min + "</td>";
    max = "<td>" + city.max + "</td>";
    current = "<td>" + city.current + "</td>";
    in_range = "<td>" + city.in_range + "</td>";
    edit = "<td><button class=\"edit btn btn-sm btn-primary " + inRange +"\" id=\"" + String(i)+"\">Edit</button></td>";
    remove = "<td><button class=\"remove btn btn-sm btn-danger "+ inRange +"\" id=\"" + String(i)+"\">Remove</button></td>";
    html += "<tr id=\"tr-"+String(i)+"\" class=\"row-inrange-" + inRange+"\">"+name+min+max+current+edit+remove+in_range+"</tr>";
    table.insertAdjacentHTML('beforeend', html);
  }
  removeClickListener();
  editClickListener();
}

function showEditForm(e) {
  var index = +e.target.id;
  var tr = document.getElementById("tr-"+String(index))
  var city = cities[index]
  var inRange = city.in_range;
  var name = "<div><label>City</label><input type=\"text\" value=\""+city.name+" \"name=\"name\"></div>";
  var min = "<div><label>Min Temp</label><input type=\"number\" value=\""+city.min+"\" name=\"min\"></div>";
  var max = "<div><label>Max Temp</label><input type=\"number\" value=\""+city.max+"\" name=\"max\"></div>";
  var update = "<button class=\"update-city btn btn-primary " + inRange +" \" id=\"" + String(index) + "\">Update</button>";
  var cancel = "<button class=\"close btn btn-danger\" id=\"close-edit-form\">Cancel</button>";
  var html = "<form id=\"edit-form\"></form>";
  $("#tr-"+String(index)).after(html);
  tr.remove();
  document.getElementById("edit-form").innerHTML = name+min+max+update+cancel
  cancelEditClickListener();
  updateCityClickListener();
}

function resetFormValues() {
  var inputs = document.forms[0].getElementsByTagName('input')
  for (var i=0;i<inputs.length;i++) {
    inputs[i].value = null;
  }
}

function showDataInvalidMessage() {
  var message = "Data is not valid. City, Min and Max must be present. " +
                "Max must be greater than min";
  alert(message);
}
function newCitySubmit(e) {
  e.preventDefault();
  var city = serialize();

  if (dataValid(city)) {
    city.current = "";
    var options = {"data":{"city": city}};
    sendApiRequest(options, function(err,response) {
      if (err || response["error"]) {
        //console.error(err)
        alert("There was a problem adding your city");
      } else {
        resetFormValues();
        cities.push(response)
        updateCities();
      }
    });

  } else {
    showDataInvalidMessage();
  }
}

function replaceCity(e, city) {
  var index = +e.target.id;
  if (e.target.classList[1] == "true") {
    citiesInRange.splice(index,1);
  } else {
    citiesOutOfRange.splice(index,1);
  }
  if (city && city.in_range) {
    citiesInRange.splice(index,0,city);
  } else {
    citiesOutOfRange.splice(index,0,city);
  }
  combineCities();
  refreshTable();
}

function updateCities() {
  var options = { "data":{"cities": JSON.stringify(cities)},"multiple":true};
  sendApiRequest(options, function(err,response) {
    if (err || response["error"]) {
      error = err || response["error"]
      //console.error(error)
      alert("There was a problem updating cities");
    } else {
      cities = response;
      reorderCities();
      refreshTable();
    }
  });
}

function updateCity(e) {
  var city = serialize();
  if (dataValid(city)) {
    var options = {"data":{"city": city}};
    sendApiRequest(options, function(err,response) {
      if (err || response["error"]) {
        //console.error(err)
        alert("There was a problem editing your city");
      } else {
        replaceCity(e,response)
        updateCities();
      }
    });
  } else {
    showDataInvalidMessage();
  }
  e.preventDefault();
}

function combineCities() {
  cities = []
  for (var i=0; i<citiesInRange.length;i++) {
    cities.push(citiesInRange[i]);
  }
  for (var i=0; i<citiesOutOfRange.length;i++) {
    cities.push(citiesOutOfRange[i]);
  }
}

function separateCities() {
  citiesOutOfRange = [];
  citiesInRange = [];
  var city;
  for (var i=0; i < cities.length; i++) {
    city = cities[i]
    if (city && city.in_range) {
      citiesInRange.push(city);
    } else {
      citiesOutOfRange.push(city);
    }
  }
}

function reorderCities() {
  separateCities();
  combineCities();
}

function sendApiRequest(options,callback) {
  var path = options["multiple"] ? "/cities" : "/city"
  $.ajax({
    url: "http://172.17.0.2:3000" + path,
    method: "POST",
    dataType: "json",
    data: options["data"]
  })
  .done(function(response) {
    callback(null,response)
  })
  .fail(function(err,one,two) {
    callback(err)
  });
}

function refreshTemps(e) {
  updateCities();
  e.preventDefault();
}

function removeCity(e) {
  var index = +e.target.id;
  if (e.target.classList[1] == "true") {
    citiesInRange.splice(index, 1);
  } else {
    citiesOutOfRange.splice(index, 1);
  }
  reorderCities();
  refreshTable();
}

function closeEditForm(e) {
  refreshTable()
  e.preventDefault();
}

/************************************************************
 * LISTENERS
 * **********************************************************/

function addClickListener() {
  document.getElementById("add")
          .addEventListener("click", newCitySubmit);
}

function refreshClickListener() {
  var element = document.getElementById("refresh");
  element.addEventListener("click", refreshTemps);
}

function removeClickListener() {
  var elements = document.getElementsByClassName("remove");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", removeCity);
  }
}

function cancelEditClickListener() {
  var element = document.getElementById("close-edit-form");
  element.addEventListener("click", closeEditForm);
}

function updateCityClickListener() {
  var element = document.getElementsByClassName("update-city")[0];
  element.addEventListener("click", updateCity);
}

function editClickListener() {
  var elements = document.getElementsByClassName("edit");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", showEditForm);
  }
}

/************************************************************
 * INITIATORS
 * **********************************************************/

refreshClickListener();
addClickListener();
