var myVar;
		function loadFunction() {
			myVar = setTimeout(showPage, 500);
		}
		function showPage() {
		  document.getElementById("loader").style.display = "none";
		  document.getElementById("loadedDiv").style.display = "block";
		}