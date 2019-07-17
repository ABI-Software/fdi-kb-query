const axios = require('axios');
const biolucidaclient_module = require('@abi-software/biolucidaclient').biolucidaclient_module
const parseString = require('xml2js').parseString;
require("./styles/searchwidget.css");
require("./styles/searchresultslist.css");
require("./styles/searchresult.css");

exports.FDI_KB_Query_Module = function(parent_in)  {
  const kb_endpoint = "knowledgebase/"
  const parent = parent_in;
  const per_page = 5;
  const query_context = 'SCR_017041-3';

  let biolucidaclient = undefined;
  let channel = undefined;
  let search_results = undefined;

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

  const renderResult = (result_parent, data) => {
    let element = this.htmlToElement(require("./snippets/searchresult.html"))
    let heading = element.querySelector("#mapcore_search_result_heading");
    heading.innerHTML = data['Dataset Title']
    let paragraph = element.querySelector("#mapcore_search_result_paragraph");
    paragraph.innerHTML = data['Description']
    let image_paragraph = element.querySelector("#mapcore_search_result_image_paragraph");
    image_paragraph.classList.add("float-left")
    let img_id = data['Example Image']
    if (img_id) {
      let image = element.querySelector("#mapcore_search_result_thumbnail")
      image.classList.remove('optional')
      biolucidaclient.get_thumbnail(image, img_id)
    }
    result_parent.appendChild(element)
  }

  const setupButton = (element, page_number) => {
    if (page_number !== null) {
      element.setAttribute("page_number", page_number.toString())
      element.addEventListener("click", this.onPageChange)
    } else {
      element.disabled = true
    }
  }

  const renderFooter = (footer_parent, prior_page, next_page) => {
    let element = this.htmlToElement(require("./snippets/searchfooter.html"))
    let prior_page_element = element.querySelector("#mapcore_prev_page")
    setupButton(prior_page_element, prior_page)
    let next_page_element = element.querySelector("#mapcore_next_page")
    setupButton(next_page_element, next_page)
    footer_parent.appendChild(element)
  }

  const renderResults = (data, page_number) => {
	  if (data) {
	    this.clearResults(true)
	    paged_data = paginator(data, page_number, per_page)
	    let search_results_element = parent.querySelector('#mapcore_search_results_list')
	    for (let i=0; i < paged_data.data.length; i++) {
          renderResult(search_results_element, paged_data.data[i])
	    }
	    renderFooter(search_results_element, paged_data.pre_page, paged_data.next_page)
	    showSearchResults(true)
	  }
  }

  const setElementClass = (element, state, css_class) => {
    if (state) {
      element.classList.add(css_class)
    } else {
      element.classList.remove(css_class)
    }
  }

  const showSearchResults = (state) => {
    let elements = parent.querySelectorAll('.maptab-tab-content')
    elements.forEach( function (element) {
      setElementClass(element, state, "margin-left-26")
    })
    let search_results_element = parent.querySelector("#mapcore_search_results_container")
    setElementClass(search_results_element, !state, "hidden")
    let search_widget_element = parent.querySelector("#mapcore_search_widget")
    setElementClass(search_widget_element, state, "margin-right-8")
  }

  this.clearResults = (soft_clear) => {
    if (soft_clear !== true) {
      showSearchResults(false)
    }
    let search_results_element = parent.querySelector('#mapcore_search_results_list')
    let child = search_results_element.lastElementChild;
    while (child) {
      search_results_element.removeChild(child);
      child = search_results_element.lastElementChild;
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
    renderResults(search_results, parseInt(event.srcElement.getAttribute("page_number")));
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
	axios.get(kb_endpoint + data_set, {
	   params: query_params,
	 })
	 .then(function (response) {
	    parseString(response.data, function (err, result) {
	      if (result !== undefined) {
            let data = jsonifyResults(result.responseWrapper.result[0].results[0].row);
            search_results = augmentResults(data, query_params)
            renderResults(search_results, 1);
	      }
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
    let search_input = parent.querySelector("#mapcore_search_input");
    this.query(query_context, {q:search_input.value})
  }

  this.broadcastCallback = (message) => {
    let search_input = parent.querySelector("#mapcore_search_input");
    if (message.data.data.resource) {
      search_input.value = message.data.data.resource
      doQuery()
    }
  }

  const setupSearchWidget = (container) => {
    container.insertBefore(this.htmlToElement(require("./snippets/searchwidget.html")), container.childNodes[0])
    let search_form = container.querySelector("#mapcore_search_form");
    if (search_form) {
      search_form.addEventListener("reset", this.clearResults);
      search_form.addEventListener("submit", event => {
        event.preventDefault()
        doQuery()
      })
    }
  }

  const setupSearchResults = (container) => {
    container.insertBefore(this.htmlToElement(require("./snippets/searchresultslist.html")), container.childNodes[0])
  }

  const initialise = () => {
    // Add my snippet for the query dialog to the parent element.
    biolucidaclient = new biolucidaclient_module();
    channel = new BroadcastChannel('sparc-portal');
    channel.addEventListener('message', this.broadcastCallback);
    let container = parent.querySelector("#maptab_contents");
    if (container !== undefined) {
      setupSearchResults(container);
    }
    container = parent.querySelector("#maptab_tabbar");
    if (container !== undefined) {
      setupSearchWidget(container);
    }
  }

  initialise();
}
