const axios = require('axios');
const biolucidaclient_module = require('@abi-software/biolucidaclient').biolucidaclient_module
const parseString = require('xml2js').parseString;
let secrets = require("./.secrets/key")
require("./styles/searchwidget.css");

exports.FDI_KB_Query_Module = function(parent_in)  {
  const kb_endpoint = "knowledgebase/"
  const parent = parent_in;
  const per_page = 5;
  const query_context = 'SCR_017041-3';

  let biolucidaclient = undefined;
  let channel = undefined;
  let searchResults = undefined;

  const paginator = (items, page, per_page) => {

    page = page || 1,
    per_page = per_page || 10,
    offset = (page - 1) * per_page,

    paginatedItems = items.slice(offset).slice(0, per_page),
    total_pages = Math.ceil(items.length / per_page);
    return {
      page: page,
      per_page: per_page,
      pre_page: page - 1 ? page - 1 : null,
      next_page: (total_pages > page) ? page + 1 : null,
      total: items.length,
      total_pages: total_pages,
      data: paginatedItems
    };
  }

  const renderResult = (parent, data) => {
    let element = this.htmlToElement(require("./snippets/searchresult.html"))
    let heading = element.querySelector("#heading");
    heading.innerHTML = data['Dataset Title']
    let paragraph = element.querySelector("#paragraph");
    paragraph.innerHTML = data['Description']
    let image_paragraph = element.querySelector("#image_paragraph");
    image_paragraph.classList.add("float-left")
    let img_id = data['Example Image']
    if (img_id) {
      let image = element.querySelector("#thumbnail")
      image.classList.remove('optional')
      biolucidaclient.get_thumbnail(image, img_id)
    }
    parent.appendChild(element)
  }

  const setupButton = (element, page_number) => {
    if (page_number !== null) {
      element.setAttribute("page_number", page_number.toString())
      element.addEventListener("click", this.onPageChange)
    } else {
      element.disabled = true
    }
  }

  const renderFooter = (parent, prior_page, next_page) => {
    let element = this.htmlToElement(require("./snippets/searchfooter.html"))
    let prior_page_element = element.querySelector("#prior_page")
    setupButton(prior_page_element, prior_page)
    let next_page_element = element.querySelector("#next_page")
    setupButton(next_page_element, next_page)
    parent.appendChild(element)
  }

  const renderResults = (data, page_number) => {
	  if (data) {
	    this.clearResults()
	    paged_data = paginator(data, page_number, per_page)
	    let search_results = parent.querySelector('#search_results')
	    for (let i=0; i < paged_data.data.length; i++) {
          renderResult(search_results, paged_data.data[i])
	    }
	    renderFooter(search_results, paged_data.pre_page, paged_data.next_page)
	  }
  }

  this.clearResults = () => {
    let search_results = parent.querySelector('#search_results')
    let child = search_results.lastElementChild;
    while (child) {
      search_results.removeChild(child);
      child = search_results.lastElementChild;
    }
  }

  const augmentResults = (data, params) => {
    if (data) {
      for (let i = 0; i < data.length; i++) { //https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03
        let blackfynn_id = data[i]['BlackfynnID']
        if (blackfynn_id.includes('N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0') &&
           blackfynn_id.includes('N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03') ) {
           data[i]['Example Image'] = '106' //http://sparc.biolucida.net/link?l=vua1n9'
        }
      }
    }
    return data
  }
  
  const jsonifyResults = row => {
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

  this.onPageChange = (event) => {
    renderResults(searchResults, parseInt(event.srcElement.getAttribute("page_number")));
  }

 /**
  * @param {String} HTML representing a single element
  * @return {Element}
  */
  this.htmlToElement = (html) => {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  }

  this.query = (data_set, query_params) => {
    let params = Object.assign({}, query_params, {'key': secrets.key})
	axios.get(kb_endpoint + data_set, {
	   params: params,
	 })
	 .then(function (response) {
	    parseString(response.data, function (err, result) {
	      let data = jsonifyResults(result.responseWrapper.result[0].results[0].row);
	      searchResults = augmentResults(data, params)
	      renderResults(searchResults, 1);
	    });
	  })
	  .catch(function (error) {
	    console.log("------- KB REQUEST ERROR ---------")
	    console.log(error);
	  })
	  .then(function () {
	  });
  }

  const doQuery = () => {
    let search_input = parent.querySelector("#search-input");
    this.query(query_context, {q:search_input.value})
  }

  this.broadcastCallback = (message) => {
    let search_input = parent.querySelector("#search-input");
    if (message.data.data.type) {
      search_input.value = message.data.data.type
      doQuery()
    }
  }

   const initialise = () => {
     // Add my snippet for the query dialog to the parent element.
     biolucidaclient = new biolucidaclient_module();
     let container = parent.querySelector("#maptab_tabbar");
     if (container !== undefined) {
       container.insertBefore(this.htmlToElement(require("./snippets/searchwidget.html")), container.childNodes[0])
       channel = new BroadcastChannel('sparc-portal');
       channel.addEventListener('message', this.broadcastCallback);
       let search_form = container.querySelector("#search_form");
       if (search_form) {
         search_form.addEventListener("reset", this.clearResults);
         search_form.addEventListener("submit", event => {
           event.preventDefault()
           doQuery()
         })
       }
     }
  }

  initialise();
}
