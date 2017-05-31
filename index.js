var citiesInRange = [], citiesOutOfRange = [];

function serialize() {
  var data = {},inputs,c,i;
  inputs = [].slice.call(document.forms[0].getElementsByTagName(controls['input']));
  for (i = 0; i < inputs.length; i++) {
    data[inputs[i].name] = inputs[i].value;
  }
  return data;
}

function dataValid(data) {
  return data &&
         data.min && +data.min != NaN &&
         data.max && +data.max != NaN && data.max > data.min &&
         data.city && data.city.length > 2;
}

function refreshList(cities,id) {
  var html,city,min,max,currentTemp;
  var list = document.getElementById(id);
  list.innerHTML = "";
  for (var i = 0; i < cities.length; i++) {
    html = "";
    city = cities[i];
    min = "<p>Min: " + city.min + "</p>";
    max = "<p>Max: " + city.max + "</p>";
    current = "<p>Current: " + city.current + "</p>";
    remove = "<button class=\"remove\" id=\""+String(i)+"\">Remove</button>";
    html += "<li>"+city+min+max+current+"</li><hr>";
    list.insertAdjacentHTML('beforeend', html);
  }
  removeClickListener();
}

function refreshBothLists() {
  refreshList(citiesInRange, "citites-in-range");
  refreshList(citiesOutOfRange, "citites-out-of-range");
}

function newCitySubmit(e) {
  var data = serialize();
  if (dataValid(data)) {
    citiesOutOfRange.push(data);
    refreshBothLists();
  } else {
    var message = "Data is not valid. City, Min and Max must be present. " +
                  "Max must be greater than min";
    alert(message);
  }
  e.preventDefault()
}

function combineLists() {
  var combinedList = citiesOutOfRange;
  for (var i=0; i<citiesInRange.length;i++) {
    combinedList.push(citiesInRange[i]);
  }
  return combinedList;
}
function handleSubmit(e) {
  var combinedList = combineLists();
  var json = JSON.stringify({"cities": combinedList});
  e.preventDefault()
}

function removeCity(e) {
  var index = +e.target.id;
  //list.splice(index, 1);
  //refreshList();
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

submitClickListener();
addClickListener();

