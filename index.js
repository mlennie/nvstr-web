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

function refreshList(cities,id) {
  var html,city,min,max,currentTemp;
  var list = document.getElementById(id);
  list.innerHTML = "";
  for (var i = 0; i < cities.length; i++) {
    html = "";
    city = cities[i];
    inRange = city.in_range;
    name = "<p>City: " + city.name + "</p>";
    min = "<p>Min: " + city.min + "</p>";
    max = "<p>Max: " + city.max + "</p>";
    current = "<p>Current: " + city.current + "</p>";
    edit = "<button class=\"edit " + inRange +"\" id=\"" + String(i)+"\">Edit</button>";
    remove = "<button class=\"remove "+ inRange +"\" id=\"" + String(i)+"\">Remove</button>";
    html += "<li>"+name+min+max+current+edit+remove+"</li><hr>";
    list.insertAdjacentHTML('beforeend', html);
  }
  removeClickListener();
  editClickListener();
}

function showEditForm(e) {
  refreshBothLists()
  var index = +e.target.id;
  if (e.target.classList[1] == "true") {
    var containerId = "cities-in-range";
    var cityList = citiesInRange;
  } else {
    var containerId = "cities-out-of-range";
    var cityList = citiesOutOfRange;
  }
  var ol = document.getElementById(containerId)
  var items = ol.getElementsByTagName("li");
  var li = items[index];
  var city = cityList[index]
  var inRange = city.inRange;
  var name = "<div><label>City</label><input type=\"text\" value=\""+city.name+" \"name=\"name\"></div>";
  var min = "<div><label>Min Temp</label><input type=\"number\" value=\""+city.min+"\" name=\"min\"></div>";
  var max = "<div><label>Max Temp</label><input type=\"number\" value=\""+city.max+"\" name=\"max\"></div>";
  var update = "<button class=\"update-city " + inRange +" \" id=\"" + String(index) + "\">Update</button>";
  var cancel = "<button class=\"close \" id=\"close-edit-form\">Cancel</button>";
  var html = "<form id=\"edit-form " + inRange +"\">"+name+min+max+update+cancel+"</form>";
  li.innerHTML = html;
  cancelEditClickListener();
  updateCityClickListener();
}

function refreshBothLists() {
  refreshList(citiesInRange, "cities-in-range");
  refreshList(citiesOutOfRange, "cities-out-of-range");
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
    citiesInRange[index] = city;
  } else {
    citiesOutOfRange[index] = city;
  }
  combineLists();
  refreshBothLists();
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
      separateLists();
      refreshBothLists();
    }
  });
}

function updateCity(e) {
  var city = serialize();
  resetFormValues();
  if (dataValid(city)) {
    data.current = "";
    var options = {"data":{"city": city}};
    sendApiRequest(options, function(err,response) {
      replaceCity(e,response)
    });
  } else {
    showDataInvalidMessage();
  }
  e.preventDefault();
}

function combineLists() {
  cities = citiesOutOfRange;
  for (var i=0; i<citiesInRange.length;i++) {
    cities.push(citiesInRange[i]);
  }
}

function separateLists() {
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
  combineLists();
  refreshBothLists();
}

function closeEditForm(e) {
  refreshBothLists()
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
