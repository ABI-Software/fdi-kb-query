main = function()  {
	var parent = window.document.querySelectorAll("#kb_query_div")[0];
	const kb_query = new fdikbquery.FDI_KB_Query(parent);
	      
}

window.document.addEventListener('DOMContentLoaded', main);
