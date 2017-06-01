var citiesOutOfRange = [], citiesInRange = [], cities = [];

function serialize(form) {
  var data = {},inputs,c,i;
  inputs = [].slice.call(document.forms[form].getElementsByTagName('input'));
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
    inRange = city.inRange;
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
  var name = "<div><label>City</label><input type=\"text\" value=\""+city.name+" \"name=\"name\"></div>";
  var min = "<div><label>Min Temp</label><input type=\"number\" value=\""+city.min+"\" name=\"name\"></div>";
  var max = "<div><label>Max Temp</label><input type=\"number\" value=\""+city.max+"\" name=\"name\"></div>";
  var update = "<button class=\"update-city \" id=\"update-city\">Update</button>";
  var cancel = "<button class=\"close \" id=\"close-edit-form\">Cancel</button>";
  var html = "<form id=\"edit-form\">"+name+min+max+update+cancel+"</form>";
  li.innerHTML = html;
  cancelEditClickListener();
}

function refreshBothLists() {
  refreshList(citiesInRange, "cities-in-range");
  refreshList(citiesOutOfRange, "cities-out-of-range");
}

function newCitySubmit(e) {
  refreshBothLists();
  var data = serialize(0);
  if (dataValid(data)) {
    data.current = "";
    data.inRange = false;
    citiesOutOfRange.push(data);
    combineLists();
    refreshBothLists();
  } else {
    var message = "Data is not valid. City, Min and Max must be present. " +
                  "Max must be greater than min";
    alert(message);
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
    if (city && city.withinRange) {
      citiesInRange.push(city);
    } else {
      citiesOutOfRange.push(city);
    }
  }
}

function handleSubmit(e) {
  combineLists();
  var json = JSON.stringify({"cities": combinedList});
  e.preventDefault()
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

function addClickListener() {
  document.getElementById("add")
          .addEventListener("click", newCitySubmit);
}

function submitClickListener() {
  document.forms[0]
          .addEventListener("submit", handleSubmit);
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

function editClickListener() {
  var elements = document.getElementsByClassName("edit");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", showEditForm);
  }
}

submitClickListener();
addClickListener();
