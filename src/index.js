const axios = require('axios');
const parseString = require('xml2js').parseString;
require("./styles/fdi_kb.css");

exports.FDI_KB_Query = function(parentIn)  {
  const endpoint = "/knowledgebase_query_reverse/";
  const parent = parentIn;
  
  const drawTable = (data, queryParams) => {
	  let resultString = "";
	  if (data) {
		  resultString += "Results of " + queryParams.q + ": " + data.length;
		  for (let i = 0; i < data.length; i++) {
			  resultString += "<br><br><table class='kbtable'>";
			  resultString += "<tr><th>Result</th><th>" + (i+1) +"</th></tr>";
			  if (data[i]["Dataset Name"]) {
				  resultString += "<tr>"
				  resultString += "<th>" + "Dataset Name" + "</th>";
				  resultString += "<th>" +  data[i]["Dataset Name"] + "</th>";
				  resultString += "</tr>";
			  }
			  
			  for (var key in data[i]) {
				  if (key !== "Dataset Name") {
					  resultString += "<tr>"
					  resultString += "<th>" + key + "</th>";
					  resultString += "<th>" +  data[i][key] + "</th>";
					  resultString += "</tr>";
				  }
			  }
			  resultString += "</table>"
		  }
		  resultString += "<br><br> End of results<br><br>";
	  } else {
		  resultString += "Results of " + queryParams.q + ": 0";
	  }
	  
	  parent.querySelectorAll("#main_table")[0].innerHTML = resultString;
  }
  
  const beautifyResult = row => {
	  if (row) {
		  let array = [];
		  for (let i = 0; i < row.length;i++) {
			 let rowData = row[i].data;
			 array[i] = [];
			 for (let j = 0; j < rowData.length; j++) {
			   array[i][rowData[j].name] = rowData[j].value[0];
			 }
		  }
		  return array;
	  }
  }
    
  this.query = (dataset, queryParams) => {
	  parent.querySelectorAll("#query_form")[0][1].value = queryParams.q;
	  axios.get(endpoint+dataset, {
	    params: queryParams
	  })
	  .then(function (response) {
	    parseString(response.data, function (err, result) {
	    	const data = beautifyResult(result.responseWrapper.result[0].results[0].row);
	    	drawTable(data, queryParams);
	    });
	  })
	  .catch(function (error) {
	    console.log(error);
	  })
	  .then(function () {
	  });
  }
    
  const initialise = () => {
	 let query_form = parent.querySelectorAll("#query_form")[0];
	 if (query_form)
		 query_form.addEventListener("submit", (e => {
			 this.query(e.srcElement[0].value, {q:e.srcElement[1].value, count:e.srcElement[2].value});
			 e.preventDefault();
		 }), false);
  }

  initialise();
}
