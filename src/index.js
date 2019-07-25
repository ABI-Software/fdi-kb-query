const axios = require('axios');
const biolucidaclient_module = require('@abi-software/biolucidaclient').biolucidaclient_module
const prepackagedresults_module = require('@abi-software/mapcore-pre-packaged-results').mapcore_pre_packaged_results_module
const augmentedresults_module = require('@abi-software/mapcore-augmented-results').mapcore_augmented_results_module
const parseString = require('xml2js').parseString;
require("./styles/searchwidget.css");
require("./styles/searchresultslist.css");
require("./styles/searchresult.css");
require("./styles/searchresultinfull.css");
require("./styles/searchcommon.css");

exports.FDI_KB_Query_Module = function(parent_in)  {
  const kb_endpoint = "knowledgebase/"
  const parent = parent_in;
  const per_page = 5;
  const query_context = 'SCR_017041-3';

  const search_alternatives = {HB_155A_3: "UBERON:0000948", HB_155A_4: "UBERON:0000948", HB_100A_2: "UBERON:0000948", HB_155A_1: "UBERON:0000948" }

  let biolucida_client = undefined;
  let pre_packaged_results = undefined;
  let augmented_results = undefined;
  let channel = undefined;
  let current_results = undefined;

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

const renderTitle = (title, link) => {
  var return_title = undefined
  var title_text = title.substring(0, title.indexOf("<a"))
  if (title_text == "") {
    title_text = title
  }
  title_text = title_text.replace(/_/g, " ")

  var link_text = title.substring(title.indexOf("<a"))
  if (link) {
    return_title = '<a class="external" target="_blank" href="' + link + '">' + title_text + '</a>'
  } else {
    return_title = title_text
  }

  return return_title
}

const renderDescription = (description, max_length) => {
  if (max_length == undefined) {
    max_length = 1000
  }

  var trimmed_description = description.length < max_length ?
        description :
        description.substring(0, max_length - 3) + "..."

  return trimmed_description
}

  const renderOverlayResult = (overlay_parent, data) => {
    let element = this.htmlToElement(require("./snippets/searchresultoverlay.html"))
    let heading = element.querySelector("#mapcore_search_result_heading")
    heading.innerHTML = renderTitle(data['Dataset Title'], true)
    let paragraph = element.querySelector("#mapcore_search_result_paragraph")
    paragraph.innerHTML = renderDescription(data['Description'], 300)
    if (isCuratedData(data)) {
      let curated_paragraph = element.querySelector("#mapcore_search_result_curated_data_paragraph")
      curated_paragraph.classList.add("hidden")
    }
    if (haveScaffold(data)) {
      let target_element = element.querySelector("#mapcore_search_result_scaffold_map")
      target_element.classList.remove("disabled-map")
      target_element.classList.add("cursor-pointer")
      target_element.onclick = function(event) {
        let supplementary_data = {'species': data["Scaffold"]["species"], 'organ': data["Scaffold"]["organ"], 'annotation': data["Scaffold"]["annotation"]}
        let message_data = {action: "scaffold-show", resource: data["Scaffold"]["uri"], data: supplementary_data, sender: 'query-engine'};
        channel.postMessage(message_data)
      }
    }
    if (haveDataViewer(data)) {
      let target_element = element.querySelector("#mapcore_search_result_data_viewer_map")
      target_element.classList.remove("disabled-map")
      target_element.classList.add("cursor-pointer")
      target_element.onclick = function(event) {
        let supplementary_data = {'species': data["DataViewer"]["species"], 'organ': data["DataViewer"]["organ"], 'annotation': data["DataViewer"]["annotation"]}
        let message_data = {action: "data-viewer-show", resource: data["DataViewer"]["uri"], data: supplementary_data, sender: 'query-engine'};
        channel.postMessage(message_data)
      }
    }
    if (haveFlatmap(data)) {
      let target_element = element.querySelector("#mapcore_search_result_flatmap_map")
      target_element.classList.remove("disabled-map")
      target_element.classList.add("cursor-pointer")
      target_element.onclick = function(event) {
        let supplementary_data = {}
        let message_data = {action: "flatmap-show", resource: "NCBITaxon:9606", data: supplementary_data, sender: 'query-engine'};
        channel.postMessage(message_data)
      }
    }
    if (haveSimulation(data)) {
      let target_element = element.querySelector("#mapcore_search_result_simulation_map")
      target_element.classList.remove("disabled-map")
      target_element.classList.add("cursor-pointer")
      target_element.onclick = function(event) {
        let supplementary_data = {}
        let message_data = {action: "simulation-show", resource: data["Simulation"]["uri"], data: supplementary_data, sender: 'query-engine'};
        channel.postMessage(message_data)
        console.log('execute simulation.')
        let params  = {}
        let osparc_endpoint = 'osparc/1/0.6'
 axios.get(osparc_endpoint, {
	   params: params,
	 })
	 .then(function (response) {
    	 console.log(response)
	  })
	  .catch(function (error) {
	    console.log("------- oSPARC REQUEST ERROR ---------")
	    console.log(error);
	  })
	  }
    }
    let image_block = element.querySelector("#mapcore_search_result_image")
    image_block.classList.add("float-left")
    let img_id = data['Example Image']
    if (img_id) {
      let image = element.querySelector("#mapcore_search_result_thumbnail")
      image_block.classList.remove('off')
      biolucida_client.get_thumbnail(image, img_id)
    }

    overlay_parent.appendChild(element)
  }

  const isCuratedData = (data) => {
    let curated = false;
    if ("Dataset Status" in data && data["Dataset Status"] == "released") {
      curated = true;
    } else if ("Dataset Status" in data && data["Dataset Status"] == "embargoed") {
      curated = true;
    }

    return curated
  }

  const haveScaffold = (data) => {
    let have = false;
    if ("Scaffold" in data && "uri" in data["Scaffold"] && data["Scaffold"]["uri"]) {
      have = true;
    }
    return have;
  }

  const haveDataViewer = (data) => {
    let have = false;
    if ("DataViewer" in data && "uri" in data["DataViewer"] && data["DataViewer"]["uri"]) {
      have = true;
    }
    return have;
  }

  const haveFlatmap = (data) => {
    let have = false;
    if ("Species" in data && data["Species"].includes("NCBITaxon")) {
      have = true;
    }
    return have;
  }

  const haveSimulation = (data) => {
    let have = false;
    if ("Simulation" in data && "uri" in data["Simulation"] && data["Simulation"]["uri"]) {
      have = true;
    }
    return have;
  }

  const haveImage = (data) => {
    let have = false;
    if ("Example Image" in data && data["Example Image"]) {
      have = true
    }
    return have;
  }

  const getImageId = (image_uri) => {
    let params = (new URL(image_uri)).searchParams
    let encoded_parameter = params.get('c')
    let parameter = atob(encoded_parameter)
    let parts = parameter.split("-")
    return parts[0]
  }

  const createIconSpan = (span_id) => {
    let span_element = document.createElement("span");
    span_element.setAttribute("id", span_id)
    span_element.classList.add("mapcore-search-icon")
    span_element.classList.add("mapcore-search-icon-small")
    return span_element
  }

  const addIconLinks = (target_element, action_type, resource, supplementary_data) => {
    target_element.classList.add("cursor-pointer")
    target_element.onclick = function(event) {
      let message_data = {action: action_type, resource: resource, data: supplementary_data, sender: 'query-engine'};
      channel.postMessage(message_data)
    }
  }

  const renderResult = (element, data, add_links) => {
    let heading = element.querySelector("#mapcore_search_result_heading_text")
    heading.innerHTML = renderTitle(data['Dataset Title'], data['Links'])
    let paragraph = element.querySelector("#mapcore_search_result_paragraph")
    paragraph.innerHTML = renderDescription(data['Description'])
    let icons_element = element.querySelector("#mapcore_search_result_icons")
    if (isCuratedData(data)) {
      let target_element = element.querySelector("#mapcore_search_result_curated_data_paragraph")
      target_element.classList.add("hidden")
    }
    if (haveScaffold(data)) {
      let span_element = createIconSpan("mapcore_search_result_scaffold_map")
      if (add_links) {
        let supplementary_data = {'species': data["Scaffold"]["species"], 'organ': data["Scaffold"]["organ"], 'annotation': data["Scaffold"]["annotation"]}
        addIconLinks(span_element, "scaffold-show", data["Scaffold"]["uri"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveDataViewer(data)) {
      let span_element = createIconSpan("mapcore_search_result_data_viewer_map")
      if (add_links) {
        let supplementary_data = {'species': data["DataViewer"]["species"], 'organ': data["DataViewer"]["organ"], 'annotation': data["DataViewer"]["annotation"]}
        addIconLinks(span_element, "data-viewer-show", data["DataViewer"]["uri"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveFlatmap(data)) {
      let span_element = createIconSpan("mapcore_search_result_flatmap_map")
      if (add_links) {
        let supplementary_data = {}
        addIconLinks(span_element, "flatmap-show", data["Species"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveSimulation(data)) {
      let span_element = createIconSpan("mapcore_search_result_simulation_map")
      if (add_links) {
        let supplementary_data = {}
        addIconLinks(span_element, "simulation-show", data["Simulation"]["uri"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveImage(data)) {
      let image_block = element.querySelector("#mapcore_search_result_image")
      image_block.classList.add("float-left")
      image_block.classList.remove('off')
      let img_id = getImageId(data["Example Image"])
      let image = element.querySelector("#mapcore_search_result_thumbnail")
      biolucida_client.get_thumbnail(image, img_id)
      let span_element = createIconSpan("mapcore_search_result_image_map")
      if (add_links) {
        let supplementary_data = {}
        addIconLinks(span_element, "image-show", data["Example Image"], supplementary_data)
        addIconLinks(image, "image-show", data["Example Image"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
  }

  const renderFullResult = (parent, data) => {
    let element = this.htmlToElement(require("./snippets/searchresultinfull.html"))
    renderResult(element, data, true)
    let image_block = element.querySelector("#mapcore_search_result_image")
    image_block.classList.remove("float-left")
    image_block.classList.add("text-center")
    let icon_elements = element.querySelectorAll(".mapcore-search-icon")
    icon_elements.forEach(function(element) {
      element.classList.remove("mapcore-search-icon-small")
      element.classList.add("mapcore-search-icon-medium")
    });

    parent.appendChild(element)
  }

  const renderShortResult = (result_parent, entry_index, data) => {
    let element = this.htmlToElement(require("./snippets/searchresult.html"))
    renderResult(element, data, true)
    element.setAttribute("entry_index", entry_index.toString())
    element.addEventListener("click", this.resultClicked)

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

  const renderFooter = (footer_parent, paged_data) => {
    let element = this.htmlToElement(require("./snippets/searchfooter.html"))
    let prior_page_element = element.querySelector("#mapcore_prev_page")
    setupButton(prior_page_element, paged_data.pre_page)
    let next_page_element = element.querySelector("#mapcore_next_page")
    setupButton(next_page_element, paged_data.next_page)
    let first_on_page = (paged_data.page - 1) * paged_data.per_page + 1
    let first_on_page_element = element.querySelector("#mapcore_search_first_on_page")
    first_on_page_element.innerHTML = first_on_page.toString()
    let last_on_page = first_on_page + paged_data.per_page -1
    let last_on_page_element = element.querySelector("#mapcore_search_last_on_page")
    last_on_page_element.innerHTML = Math.min(last_on_page, paged_data.total).toString()
    let total_element = element.querySelector("#mapcore_search_total")
    total_element.innerHTML = paged_data.total
    footer_parent.appendChild(element)
  }

  const renderHeader = (header_parent, clearable) => {
    let element = this.htmlToElement(require("./snippets/searchheader.html"))
    let clear_element = element.querySelector("#mapcore_search_header_clear")
    if (clearable) {
      clear_element.addEventListener("click", this.clearSearchResults)
    } else {
      clear_element.classList.add("hidden")
    }
    header_parent.firstElementChild.before(element)
  }

  const renderFullResultHeader = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    let element = this.htmlToElement(require("./snippets/searchheader.html"))
    let clear_element = element.querySelector("#mapcore_search_header_clear")
    clear_element.addEventListener("click", this.clearFullSearchResult)
    let search_results_element = element.querySelector('#mapcore_search_header_text')
    search_results_element.innerHTML = ""
    search_container_element.firstElementChild.before(element)
  }

  const renderResults = (paged_data, page_number) => {
    clearSearchResultsList()
    let search_results_element = parent.querySelector('#mapcore_search_results_list')
    for (let i=0; i < paged_data.data.length; i++) {
      renderShortResult(search_results_element, (page_number - 1) * paged_data.per_page + i, paged_data.data[i])
    }
  }

  const prepareHeader = (clearable) => {
    clearHeader()
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    renderHeader(search_container_element, clearable)
  }
  
  const prepareFooter = (paged_data, visible) => {
    clearFooter()
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    renderFooter(search_container_element, paged_data)
  }

  const renderSearchResults = (data, page_number) => {
    setSearchResultsActive()
    storePageNumber(page_number, "search")
    paged_data = paginator(data, page_number, per_page)
    prepareHeader(true)
    renderResults(paged_data, page_number)
    prepareFooter(paged_data)
  }

  const renderStartingResults = (data, page_number) => {
    storePageNumber(page_number, "starting")
    paged_data = paginator(data, page_number, per_page)
    prepareHeader(false)
    renderResults(paged_data, page_number)
    prepareFooter(paged_data)
  }

  const storePageNumber = (page_number, variant) => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    search_container_element.setAttribute("page_number" + "_" + variant, page_number.toString())
  }

  const retrievePageNumber = (variant) => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    return parseInt(search_container_element.getAttribute("page_number" + "_" + variant))
  }

  const setSearchResultsActive = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    search_container_element.setAttribute("search_results", "active")
  }

  const setSearchResultsInActive = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    search_container_element.removeAttribute("search_results")
  }

  const getSearchResultsActive = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container')
    return search_container_element.getAttribute("search_results") === "active"
  }

  const setElementClass = (element, state, css_class) => {
    if (state) {
      element.classList.add(css_class)
    } else {
      element.classList.remove(css_class)
    }
  }

  this.resultClicked = (event) => {
    let entry_index = parseInt(event.currentTarget.getAttribute("entry_index"))
    let search_results_element = parent.querySelector('#mapcore_search_results_list')

    clearHeader()
    renderFullResultHeader()
    clearSearchResultsList()
    renderFullResult(search_results_element, current_results[entry_index])

    let container_element = parent.querySelector('#mapcore_search_results_container')
    let footer_element = container_element.querySelector(".mapcore-search-footer")
    footer_element.classList.add("hidden")
  }

  const clearSearchResultsList = () => {
    let search_results_element = parent.querySelector('#mapcore_search_results_list')
    let child = search_results_element.lastElementChild;
    while (child) {
      search_results_element.removeChild(child);
      child = search_results_element.lastElementChild;
    }
  }

  const clearFooter = () => {
    let container_element = parent.querySelector("#mapcore_search_results_container")
    let footer_element = container_element.querySelector(".mapcore-search-footer")
    if (footer_element != undefined) {
      container_element.removeChild(footer_element)
    }
  }

  const clearHeader = () => {
    let container_element = parent.querySelector("#mapcore_search_results_container")
    let header_element = container_element.querySelector(".mapcore-search-header")
    if (header_element != undefined) {
      container_element.removeChild(header_element)
    }
  }

  this.clearFullSearchResult = () => {
    let active_search_results = getSearchResultsActive()
    if (active_search_results) {
      renderSearchResults(current_results, retrievePageNumber("search"))
    } else {
      renderStartingResults(current_results, retrievePageNumber("starting"))
    }
  }

  this.clearSearchResults = () => {
    setSearchResultsInActive()
    let page_number = retrievePageNumber("starting")
    current_results = pre_packaged_results.get_results()
    renderStartingResults(current_results, page_number)
  }

  this.clearResults = () => {
    clearSearchResultsList()
  }

  const augmentResults = (data, params) => {
    sorted_data = []
    if (data) {
      for (let i = 0; i < data.length; i++) { //https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03
        let blackfynn_id = data[i]['BlackfynnID']
        if (blackfynn_id.includes('N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0') &&
           blackfynn_id.includes('N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03')) {
           data[i]['Example Image'] = 'https://sparc.biolucida.net:443/image?c=MTY0LWNvbC0zMi0wLTAtMi0w' //http://sparc.biolucida.net/link?l=vua1n9'
           data[i]['Scaffold'] = {'uri': 'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/scaffold/use_case4/rat_heart_metadata.json', 'species': 'rat', 'organ': 'heart', 'annotation': 'UBERON:0000948'}
           data[i]['DataViewer'] = {'uri': 'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-4/RNA_Seq.csv', 'species': 'rat', 'organ': 'heart', 'annotation': 'UBERON:0000948'}
           sorted_data.unshift(data[i])
        } else if (blackfynn_id.includes('N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0') &&
           blackfynn_id.includes('N:dataset:a7b035cf-e30e-48f6-b2ba-b5ee479d4de3')) {
           data[i]['Scaffold'] = {'uri': 'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/scaffold/stomach/stomach_metadata.json', 'species': 'rat', 'organ': 'stomach', 'annotation': 'UBERON:0000945'}
           sorted_data.unshift(data[i])
        } else if (blackfynn_id.includes('N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0') &&
           blackfynn_id.includes('N:dataset:e4bfb720-a367-42ab-92dd-31fd7eefb82e')) {
           data[i]['Example Image'] = 'https://sparc.biolucida.net:443/image?c=MTY0LWNvbC0zMi0wLTAtMi0w' //http://sparc.biolucida.net/link?l=vua1n9'
           sorted_data.unshift(data[i])
        } else {
          sorted_data.push(data[i])
        }
      }
      if (params.q.toUpperCase().includes("HEART") || params.q === "UBERON:0000948") {
        sorted_data.unshift({"Dataset Title": "Autonomic Nerve Stimulation Simulation", "Description": "This data links to a simulation experiment of the autonomic nerves innervating the heart.",
         "Example Image": "", "Simulation": {"uri": "https://osparc.io/study/194bb264-a717-11e9-9dff-02420aff2767", 'species': 'Human', 'organ': 'heart', 'annotation': 'UBERON:0000948'}}
        )
      }
      if (params.q.toUpperCase().includes("STELLATE") || params.q === "UBERON:0002440") {
        sorted_data.unshift({"Dataset Title": "Mouse Stellate Ganglion", "Description": "Data from the Shivkumar/Tompkins group displayed in a 3D stellate scaffold.",
          "Example Image": "", "Scaffold": {"uri": "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/scaffold/stellate/stellate_metadata.json", 'species': 'Mouse', 'organ': 'nerve', 'annotation': 'UBERON:0002440'},
          "DataViewer": {"uri": "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv", 'species': 'Mouse', 'organ': 'nerve', 'annotation': 'UBERON:0002440'}}
        )
      }
      if (params.q.toUpperCase().includes("LUNG") || params.q === "UBERON:0002048") {
        sorted_data.unshift({"Dataset Title": "Data for Mouse Lungs", "Description": "Data from Tom Taylor-Clark visualised on a 3D scaffold with electrophysiclogical data.",
          "Example Image": "", "Scaffold": {"uri": "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/scaffold/lungs/lungs_metadata.json", 'species': 'Mouse', 'organ': 'lung', 'annotation': 'UBERON:0002048'}}
        )
      }
      if (params.q.toUpperCase().includes("COLON") || params.q === "UBERON:0001155") {
        sorted_data.unshift({"Dataset Title": "Mouse Colon Data", "Description": "Data from the Howard & Tache groups where a 3D scaffold fitted to these data will be visualised on a 3D scaffold.",
          "Example Image": "", "Scaffold": {"uri": "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/scaffold/colon/colon_metadata.json", 'species': 'Mouse', 'organ': 'colon', 'annotation': 'UBERON:0001155'}}
        )
      }
    } else if (params.q == 'flatmap') {
      sorted_data = pre_packaged_results.get_flatmap_results()
    }
    return sorted_data
  }

  const ObjToSource=(o)=> {
    if (!o) return null;
    let str="",na=0,k,p;
    if (typeof(o) == "object") {
        if (!ObjToSource.check) ObjToSource.check = new Array();
        for (k=ObjToSource.check.length;na<k;na++) if (ObjToSource.check[na]==o) return '{}';
        ObjToSource.check.push(o);
    }
    k="",na=typeof(o.length)=="undefined"?1:0;
    for(p in o){
        if (na) k = "'"+p+"':";
        if (typeof o[p] == "string") str += k+"'"+o[p]+"',";
        else if (typeof o[p] == "object") str += k+ObjToSource(o[p])+",";
        else str += k+o[p]+",";
    }
    if (typeof(o) == "object") ObjToSource.check.pop();
    if (na) return "{"+str.slice(0,-1)+"}";
    else return "["+str.slice(0,-1)+"]";
}

  const jsonifyResults = row => {
    if (row) {
	  let array = [];
	  for (let i = 0; i < row.length;i++) {
	    let rowData = row[i].data;
		array[i] = [];
		obj = {}
		for (let j = 0; j < rowData.length; j++) {
		  obj[rowData[j].name] = rowData[j].value[0];
		  array[i][rowData[j].name] = rowData[j].value[0];
		}
	  }
	  return array;
    }
  }

  this.onPageChange = (event) => {
    renderSearchResults(current_results, parseInt(event.currentTarget.getAttribute("page_number")));
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
	      if (result != undefined) {
            let data = jsonifyResults(result.responseWrapper.result[0].results[0].row);
            if (data == undefined && query_params.q != 'flatmap') {
              tooltip_element = parent.querySelector("#mapcore_search_input_tooltip")
              tooltip_element.classList.add("show")
              setTimeout(function(){ tooltip_element.classList.remove("show"); }, 3000);
            } else {
              current_results = augmentResults(data, query_params)
              renderSearchResults(current_results, 1);
            }
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
    let search_term = search_input.value
    if (search_input.value in search_alternatives) {
      search_term = search_alternatives[search_input.value]
    }
    this.query(query_context, {q:search_term})
  }

  this.broadcastCallback = (message) => {
    if (message.action === "query-data") {
      let search_input = parent.querySelector("#mapcore_search_input");
      search_input.value = message.resource
      doQuery()
    }
  }

  const setupSearchWidget = (container) => {
    container.firstElementChild.after(this.htmlToElement(require("./snippets/searchwidget.html")))
    let search_form = container.querySelector(".mapcore-search-form");
    if (search_form) {
      search_form.addEventListener("reset", this.clearResults);
      search_form.addEventListener("submit", event => {
        event.preventDefault()
        doQuery()
      })
    }
  }

  const setupSearchResults = (container) => {
    container.firstElementChild.before(this.htmlToElement(require("./snippets/searchresultslist.html")))
  }

  const initialise = () => {
    // Add my snippet for the query dialog to the parent element.
    biolucida_client = new biolucidaclient_module();
    pre_packaged_results = new prepackagedresults_module();
    augmented_results = new augmentedresults_module();
    channel = new (require('broadcast-channel').default)('sparc-mapcore-channel');
    channel.onmessage = this.broadcastCallback

    setupSearchWidget(parent);
    let mapcore_content_panel_element = parent.querySelector("#mapcore_content_panel")
    setupSearchResults(mapcore_content_panel_element);
    current_results = pre_packaged_results.get_results()
    renderStartingResults(current_results, 1)
  }

  initialise();
}
