var countryData = []; // lagrar länder just nu
var datalistan='';
// Här är datan om utsläppen
function searchbar(data) {
  renderlist(data);
  $("#myInput").on('focus', function(event) {
    $('.dropdown-content').show();
  });

  // $("#myInput").on('focusout', function(event) {
  //   $('.dropdown-content').hide();
  // });
  $(document).click(function (e) {
    if ($(e.target).parents(".dropdown").length === 0) {
        $(".dropdown-content").hide();
    }
});
}

function renderlist(data) {
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
  document.getElementById('countries-list').innerHTML = datalistan;
};

function clickindropdown(b){
  // Hide it
  $(".dropdown-content").hide();
  
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



function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();

  dropDownDiv = document.getElementById("countries-list");

  a = dropDownDiv.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }

}