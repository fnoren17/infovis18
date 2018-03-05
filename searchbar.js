var countryData = []; // lagrar länder just nu
var datalistan='<input type="text" placeholder="Search.." id="myInput" onkeyup="filterFunction()">'
      // Här är datan om utsläppen
      function searchbar(data) {

        var tempNum = 0;
        for (i=0;i<data.children.length;i++) { // Kontinenter
        //  countryData.push(dummyData.children[i].name)
          for (j=0;j<data.children[i].children.length;j++) { // Länder
            countryData.push(data.children[i].children[j].name)
            //for (k=0;k<dummyData.children[i].children[j].children.length;k++) { // Produkter
              //if (countryData.includes(dummyData.children[i].children[j].children[k].name)==false){
              //countryData.push(dummyData.children[i].children[j].children[k].name)
              //}
            //}
          }
        }
        countryData.sort()
        for (i=0;i<countryData.length;i++) {
          var quickfix = "'"+countryData[i]+"'"
          datalistan+='<a href="javascript:;" onclick="clickindropdown(this)">'+countryData[i]+'</a>'
        }
        document.getElementById('myDropdown').innerHTML = datalistan;
        };

function clickindropdown(b){
  var arraybuild = {"properties":{"name" : b.textContent}};
    var map = d3.select("g#countries").selectAll("path")
        .filter(function(d){return d.properties.name == b.textContent});
     a = map.data()[0];
    if(a){
    country_clicked(a);
    } else {
        country_clicked(arraybuild);
    }
}

/* byter mellan att visa och gömma dropdown informationen */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  dropDownDiv = document.getElementById("myDropdown");
  a = dropDownDiv.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
