const axios = require('axios');
const biolucidaclient_module = require('@abi-software/biolucidaclient').biolucidaclient_module;
const prepackagedresults_module = require('@abi-software/mapcore-pre-packaged-results').mapcore_pre_packaged_results_module;
const augmentedresults_module = require('@abi-software/mapcore-augmented-results').mapcore_augmented_results_module;
const parseString = require('xml2js').parseString;
const tippy = require('tippy.js/umd/index.all.js');

require("./styles/searchwidget.css");
require("./styles/searchresultslist.css");
require("./styles/searchresult.css");
require("./styles/searchresultinfull.css");
require("./styles/searchcommon.css");


exports.FDI_KB_Query_Module = function (parent_in) {
  const kb_endpoint = `knowledgebase/`;
  const parent = parent_in;
  const per_page = 5;
  const query_context = 'SCR_017041-3';

  let biolucida_client = undefined;
  let pre_packaged_results = undefined;
  let augmented_results = undefined;
  let channel = undefined;
  let current_results = undefined;

  const paginator = (items, page, per_page) => {

    let total_pages = Math.ceil(items.length / per_page);
    page = page || 1;
    per_page = per_page || 10;
    let offset = (page - 1) * per_page;

    let paginatedItems = items.slice(offset).slice(0, per_page);
    return {
      page: page,
      per_page: per_page,
      pre_page: page - 1 ? page - 1 : null,
      next_page: (total_pages > page) ? page + 1 : null,
      total: items.length,
      total_pages: total_pages,
      data: paginatedItems
    }
  };

  const renderTitle = (title, link) => {
    let return_title = undefined;
    let title_text = title.substring(0, title.indexOf("<a"));
    if (title_text === "") {
      title_text = title
    }
    title_text = title_text.replace(/_/g, " ");

    // let link_text = title.substring(title.indexOf("<a"))
    if (link) {
      return_title = '<a class="external" target="_blank" href="' + link + '">' + title_text + '</a>'
    } else {
      return_title = title_text
    }

    return return_title
  };

  const renderDescription = (description, max_length) => {
    if (max_length === undefined) {
      max_length = 1000
    }

    return description.length < max_length ?
      description :
      description.substring(0, max_length - 3) + "..."
  };

  this.callOSPARC = () => {
    console.log('execute simulation.');
    let params = {};
    let osparc_endpoint = 'osparc/2/0.75';
    axios.get(osparc_endpoint, {
      params: params,
    })
      .then(function (response) {
        console.log("someone responded to me.");
        console.log(response)
      })
      .catch(function (error) {
        console.log("------- oSPARC REQUEST ERROR ---------");
        console.log(error);
      })
  };

  const isCuratedData = (data) => {
    let curated = false;
    if ("Dataset Status" in data && data["Dataset Status"] === "released") {
      curated = true;
    } else if ("Dataset Status" in data && data["Dataset Status"] === "embargoed") {
      curated = true;
    }

    return curated
  };

  const haveScaffold = (data) => {
    let have = false;
    if ("Scaffold" in data && "uri" in data["Scaffold"] && data["Scaffold"]["uri"]) {
      have = true;
    }
    return have;
  };

  const haveDataViewer = (data) => {
    let have = false;
    if ("DataViewer" in data && "uri" in data["DataViewer"] && data["DataViewer"]["uri"]) {
      have = true;
    }
    return have;
  };

  const haveFlatmap = (data) => {
    let have = false;
    if ("Species" in data && data["Species"].includes("NCBITaxon")) {
      have = true;
    }
    return have;
  };

  const haveSimulation = (data) => {
    let have = false;
    if ("Simulation" in data && "uri" in data["Simulation"] && data["Simulation"]["uri"]) {
      have = true;
    }
    return have;
  };

  const haveImage = (data) => {
    let have = false;
    if ("Example Image" in data && data["Example Image"]) {
      have = true
    }
    return have
  };

  const getImageId = (image_uri) => {
    let params = (new URL(image_uri)).searchParams;
    let encoded_parameter = params.get('c');
    let parameter = atob(encoded_parameter);
    let parts = parameter.split("-");
    return parts[0]
  };

  const createIconSpan = (span_id) => {
    let container = document.createElement("div");
    container.classList.add("mapcore-search-icon-container");
    let span_element = document.createElement("span");
    span_element.setAttribute("id", span_id);
    span_element.classList.add("mapcore-search-icon");
    span_element.classList.add("mapcore-search-icon-small");
    container.appendChild(span_element);
    return container
  };

  const addIconLinks = (target_element, action_type, resource, supplementary_data) => {
    target_element.classList.add("cursor-pointer");
    target_element.onclick = function () {
      let message_data = {action: action_type, resource: resource, data: supplementary_data, sender: 'query-engine'};
      channel.postMessage(message_data)
    }
  };

  const renderResult = (element, data, add_links) => {
    let heading = element.querySelector("#mapcore_search_result_heading_text");
    heading.innerHTML = renderTitle(data['Dataset Title'], data['Links']);
    let paragraph = element.querySelector("#mapcore_search_result_paragraph");
    paragraph.innerHTML = renderDescription(data['Description']);
    let icons_element = element.querySelector("#mapcore_search_result_icons");
    if (isCuratedData(data)) {
      let target_element = element.querySelector(".mapcore-search-result-curated-data-text");
      target_element.classList.add("hidden")
    }
    if (haveScaffold(data)) {
      let span_element = createIconSpan("mapcore_search_result_scaffold_map");
      if (add_links) {
        let supplementary_data = {
          'species': data["Scaffold"]["species"],
          'organ': data["Scaffold"]["organ"],
          'annotation': data["Scaffold"]["annotation"]
        };
        addIconLinks(span_element, "scaffold-show", data["Scaffold"]["uri"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveDataViewer(data)) {
      let span_element = createIconSpan("mapcore_search_result_data_viewer_map");
      if (add_links) {
        let supplementary_data = {
          'species': data["DataViewer"]["species"],
          'organ': data["DataViewer"]["organ"],
          'annotation': data["DataViewer"]["annotation"]
        };
        addIconLinks(span_element, "data-viewer-show", data["DataViewer"]["uri"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveFlatmap(data)) {
      let span_element = createIconSpan("mapcore_search_result_flatmap_map");
      if (add_links) {
        let supplementary_data = {};
        addIconLinks(span_element, "flatmap-show", data["Species"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveSimulation(data)) {
      let span_element = createIconSpan("mapcore_search_result_simulation_map");
      if (add_links) {
        let supplementary_data = {
          'species': data["Simulation"]["species"],
          'organ': data["Simulation"]["organ"],
          'annotation': data["Simulation"]["annotation"],
          'simulation_name': data['Simulation']['name']
        };
        addIconLinks(span_element, "simulation-show", data["Simulation"]["uri"], supplementary_data)
      }
      icons_element.firstElementChild.before(span_element)
    }
    if (haveImage(data)) {
      let img_id = getImageId(data["Example Image"]);
      let div_element = createIconSpan("mapcore_search_result_image");
      let img = document.createElement("img");
      img.src = 'data:image/svg+xml;utf8,<svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 309 309"><defs><style>.cls-1,.cls-2,.cls-3{fill:none;stroke-miterlimit:10;stroke-width:7px;}.cls-1{stroke:%2329abe2;}.cls-2{stroke:%23c1272d;}.cls-3{stroke:%23009245;}</style></defs><title>sparc-images-map</title><rect class="cls-1" x="3.5" y="3.5" width="302" height="302"/><line class="cls-2" x1="32" y1="77.5" x2="134" y2="77.5"/><line class="cls-2" x1="32" y1="252.5" x2="134" y2="252.5"/><line class="cls-2" x1="83.5" y1="78.5" x2="83.5" y2="252.5"/><line class="cls-3" x1="165.5" y1="252.5" x2="165.5" y2="165.5"/><line class="cls-3" x1="210.26" y1="213.76" x2="164.74" y2="168.24"/><line class="cls-3" x1="249.59" y1="169.41" x2="205.41" y2="213.59"/><line class="cls-3" x1="250.5" y1="252.5" x2="248.5" y2="165.5"/><line class="cls-3" x1="237" y1="252.5" x2="264" y2="252.5"/><line class="cls-3" x1="153" y1="252.5" x2="180" y2="252.5"/></svg>';
      div_element.firstChild.appendChild(img);
      biolucida_client.get_thumbnail(img, img_id);
      if (add_links) {
        let supplementary_data = {"Title": data["Dataset Title"]};
        addIconLinks(div_element, "image-show", data["Example Image"], supplementary_data)
      }
      icons_element.firstElementChild.before(div_element)
    }
  };

  const renderFullResult = (parent, data) => {
    let element = this.htmlToElement(require("./snippets/searchresultinfull.html"));
    renderResult(element, data, true);
    let icon_elements = element.querySelectorAll(".mapcore-search-icon");
    icon_elements.forEach(function (element) {
      element.classList.remove("mapcore-search-icon-small");
      element.classList.add("mapcore-search-icon-medium")
    });

    parent.appendChild(element);
    setupIconTooltips()
  };

  const renderShortResult = (result_parent, entry_index, data) => {
    let element = this.htmlToElement(require("./snippets/searchresult.html"));
    renderResult(element, data, true);
    element.setAttribute("entry_index", entry_index.toString());
    element.addEventListener("click", this.resultClicked);

    result_parent.appendChild(element)
  };

  const setupButton = (element, page_number) => {
    if (page_number !== null) {
      element.setAttribute("page_number", page_number.toString());
      element.addEventListener("click", this.onPageChange)
    } else {
      element.disabled = true
    }
  };

  const renderFooter = (footer_parent, paged_data) => {
    let element = this.htmlToElement(require("./snippets/searchfooter.html"));
    let prior_page_element = element.querySelector("#mapcore_prev_page");
    setupButton(prior_page_element, paged_data.pre_page);
    let next_page_element = element.querySelector("#mapcore_next_page");
    setupButton(next_page_element, paged_data.next_page);
    let first_on_page = (paged_data.page - 1) * paged_data.per_page + 1;
    let first_on_page_element = element.querySelector("#mapcore_search_first_on_page");
    first_on_page_element.innerHTML = first_on_page.toString();
    let last_on_page = first_on_page + paged_data.per_page - 1;
    let last_on_page_element = element.querySelector("#mapcore_search_last_on_page");
    last_on_page_element.innerHTML = Math.min(last_on_page, paged_data.total).toString();
    let total_element = element.querySelector("#mapcore_search_total");
    total_element.innerHTML = paged_data.total;
    footer_parent.appendChild(element)
  };

  const renderHeader = (header_parent, clearable) => {
    let element = this.htmlToElement(require("./snippets/searchheader.html"));
    let clear_element = element.querySelector("#mapcore_search_header_clear");
    if (clearable) {
      clear_element.addEventListener("click", this.clearSearchResults)
    } else {
      clear_element.classList.add("hidden")
    }
    header_parent.firstElementChild.before(element)
  };

  const renderFullResultHeader = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    let element = this.htmlToElement(require("./snippets/searchheader.html"));
    let clear_element = element.querySelector("#mapcore_search_header_clear");
    clear_element.addEventListener("click", this.clearFullSearchResult);
    let search_results_element = element.querySelector('#mapcore_search_header_text');
    search_results_element.innerHTML = "";
    search_container_element.firstElementChild.before(element)
  };

  const renderResults = (paged_data, page_number) => {
    clearSearchResultsList();
    let search_results_element = parent.querySelector('#mapcore_search_results_list');
    for (let i = 0; i < paged_data.data.length; i++) {
      renderShortResult(search_results_element, (page_number - 1) * paged_data.per_page + i, paged_data.data[i])
    }
  };

  const prepareHeader = (clearable) => {
    clearHeader();
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    renderHeader(search_container_element, clearable)
  };

  const prepareFooter = (paged_data) => {
    clearFooter();
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    renderFooter(search_container_element, paged_data)
  };

  const renderSearchResults = (data, page_number) => {
    let active_search_results = areSearchResultsActive();
    storePageNumber(page_number, active_search_results ? "search" : "starting");
    let paged_data = paginator(data, page_number, per_page);
    prepareHeader(!!active_search_results);
    renderResults(paged_data, page_number);
    prepareFooter(paged_data);
    setupIconTooltips();
    setupResultTooltips()
  };

  const storePageNumber = (page_number, variant) => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    search_container_element.setAttribute("page_number_" + variant, page_number.toString())
  };

  const retrievePageNumber = (variant) => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    return parseInt(search_container_element.getAttribute("page_number" + "_" + variant))
  };

  const setSearchResultsActive = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    search_container_element.setAttribute("search_results", "active")
  };

  const setSearchResultsInActive = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    search_container_element.removeAttribute("search_results")
  };

  const areSearchResultsActive = () => {
    let search_container_element = parent.querySelector('#mapcore_search_results_container');
    return search_container_element.getAttribute("search_results") === "active"
  };

  this.resultClicked = (event) => {
    let entry_index = parseInt(event.currentTarget.getAttribute("entry_index"));
    let search_results_element = parent.querySelector('#mapcore_search_results_list');

    clearHeader();
    renderFullResultHeader();
    clearSearchResultsList();
    renderFullResult(search_results_element, current_results[entry_index]);

    let container_element = parent.querySelector('#mapcore_search_results_container');
    let footer_element = container_element.querySelector(".mapcore-search-footer");
    footer_element.classList.add("hidden")
  };

  const clearSearchResultsList = () => {
    let search_results_element = parent.querySelector('#mapcore_search_results_list');
    let child = search_results_element.lastElementChild;
    while (child) {
      search_results_element.removeChild(child);
      child = search_results_element.lastElementChild;
    }
  };

  const clearFooter = () => {
    let container_element = parent.querySelector("#mapcore_search_results_container");
    let footer_element = container_element.querySelector(".mapcore-search-footer");
    if (footer_element) {
      container_element.removeChild(footer_element)
    }
  };

  const clearHeader = () => {
    let container_element = parent.querySelector("#mapcore_search_results_container");
    let header_element = container_element.querySelector(".mapcore-search-header");
    if (header_element) {
      container_element.removeChild(header_element);
    }
  };

  this.clearFullSearchResult = () => {
    let active_search_results = areSearchResultsActive();
    renderSearchResults(current_results, active_search_results ? retrievePageNumber("search") : retrievePageNumber("starting"))
  };

  this.clearSearchResults = () => {
    setSearchResultsInActive();
    let page_number = retrievePageNumber("starting");
    current_results = pre_packaged_results.get_results();
    renderSearchResults(current_results, page_number)
  };

  this.clearResults = () => {
    clearSearchResultsList()
  };

  const ObjToSource = (o) => {
    if (!o) {
      return null;
    }
    let str = "", na = 0, k, p;
    if (typeof (o) == "object") {
      if (!ObjToSource.check) ObjToSource.check = [];
      for (k = ObjToSource.check.length; na < k; na++) if (ObjToSource.check[na] === o) return '{}';
      ObjToSource.check.push(o);
    }
    k = "";
    na = typeof (o.length) == "undefined" ? 1 : 0;
    for (p in o) {
      if (na) {
        k = `'${p}':`;
      }
      str += typeof o[p] == "string" ? k + "'" + o[p] + "'," : str += typeof o[p] == "object" ? k + ObjToSource(o[p]) + "," : k + o[p] + ",";
    }
    if (typeof (o) == "object") {
      ObjToSource.check.pop();
    }
    if (na) {
      return "{" + str.slice(0, -1) + "}";
    } else {
      return "[" + str.slice(0, -1) + "]";
    }
  };

  const jsonifyResults = row => {
    if (row) {
      let array = [];
      for (let i = 0; i < row.length; i++) {
        let rowData = row[i].data;
        array[i] = [];
        let obj = {};
        for (let j = 0; j < rowData.length; j++) {
          obj[rowData[j].name] = rowData[j].value[0];
          array[i][rowData[j].name] = rowData[j].value[0];
        }
      }
      return array;
    }
  };

  this.onPageChange = (event) => {
    renderSearchResults(current_results, parseInt(event.currentTarget.getAttribute("page_number")));
  };

  /**
   * @param {String} html representing a single element
   * @return {ChildNode}
   */
  this.htmlToElement = (html) => {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  };

  this.query = (data_set, query_params) => {
    axios.get(kb_endpoint + data_set, {
      params: query_params,
    })
      .then(function (response) {
        parseString(response.data, function (err, result) {
          if (result !== undefined) {
            let data = jsonifyResults(result.responseWrapper.result[0].results[0].row);
            if (data === undefined && !augmented_results.isKnownSearchTermNotInKnowledgeBase(query_params.q)) {
              let tooltip_element = parent.querySelector("#mapcore_search_input_tooltip");
              tooltip_element.classList.add("show");
              setTimeout(function () {
                tooltip_element.classList.remove("show");
              }, 3000);
            } else {
              current_results = augmented_results.augment(data, query_params);
              setSearchResultsActive();
              renderSearchResults(current_results, 1);
            }
          }
        })
      })
      .catch(function (error) {
        console.log("------- KB REQUEST ERROR ---------");
        console.log(error);
      })
      .then(function () {
      })
  };

  const doQuery = () => {
    let search_input = parent.querySelector("#mapcore_search_input");
    let search_term = augmented_results.modifySearchTerm(search_input.value);
    this.query(query_context, {q: search_term})
  };

  this.broadcastCallback = (message) => {
    if (message.action === "query-data") {
      let search_input = parent.querySelector("#mapcore_search_input");
      search_input.value = message.resource;
      doQuery()
    }
  };

  const setupResultTooltips = () => {
    tippy('#mapcore_search_result_text_content',{
      content: 'View expanded description',
      placement: 'right',
      animateFill: false,
      animation: 'shift-away',
      followCursor: 'initial',
      delay: [700,0],
    })
  };

  const setupIconTooltips = () => {
    tooltip('#mapcore_search_result_flatmap_map', 'View map of organs');
    tooltip('#mapcore_search_result_data_viewer_map', 'View plot of data');
    tooltip('#mapcore_search_result_simulation_map', 'Run simulation on data');
    tooltip('#mapcore_search_result_scaffold_map', 'View data on a 3d scaffold');
    tooltip('#mapcore_search_result_image', 'View full resolution image')
  };

  const tooltip = (id, message) => {
    tippy(id,{
      content: message,
      placement: 'bottom',
      animateFill: false,
      animation: 'shift-away',
      arrow: true,
      delay: [500,0],
    })
  };

  const setupSearchWidget = (container) => {
    container.firstElementChild.after(this.htmlToElement(require("./snippets/searchwidget.html")));
    let search_form = container.querySelector(".mapcore-search-form");
    if (search_form) {
      search_form.addEventListener("reset", this.clearResults);
      search_form.addEventListener("submit", event => {
        event.preventDefault();
        doQuery()
      })
    }
  };

  const setupSearchResults = (container) => {
    container.firstElementChild.before(this.htmlToElement(require("./snippets/searchresultslist.html")))
  };

  const initialise = () => {
    // Add my snippet for the query dialog to the parent element.
    biolucida_client = new biolucidaclient_module();
    pre_packaged_results = new prepackagedresults_module();
    augmented_results = new augmentedresults_module();
    channel = new (require('broadcast-channel').default)('sparc-mapcore-channel');
    channel.onmessage = this.broadcastCallback;

    setupSearchWidget(parent);
    let mapcore_content_panel_element = parent.querySelector("#mapcore_content_panel");
    setupSearchResults(mapcore_content_panel_element);
    current_results = pre_packaged_results.get_results();
    renderSearchResults(current_results, 1)
  };

  initialise();
};
