






main = function()  {
	var parent = window.document.querySelector("#kb_query_div");
	const kb_query = new fdikbquery.FDI_KB_Query_Module(parent);

var d1 = {
  'Dataset Title': 'Molecular Phenotype Distribution of Single Rat ICN Neurons <a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03">Link</a>',
  'Investigators': 'Robbins, Shaina: https://orcid.org/0000-0002-7885-743X, Moss, Alison: https://orcid.org/0000-0002-7907-8796, Nieves, Sean: https://orcid.org/0000-0001-5807-342X, Schwaber, James: https://orcid.org/0000-0003-0598-7345, Vadigepalli, Rajanikanth: https://orcid.org/0000-0002-8405-1037',
  'Award Number': 'OT2OD023848',
  'Description': 'We developed an approach to appreciating the 3D organization of the ICN while at the same time permitting single cell transcriptomics and connectomics. Through serial cryostat sectioning of a cryopreserved heart with imaging of serially collected and stained sections, it is possible to reconstruct the 3D context and collect single neurons using laser microdissection. The transcriptional profiles of these isolated neurons can be determined down to single cell resolution and mapped back into the 3D context generated by stacking the serial images.',
  'Anatomy': 'heart | UBERON:0000948',
  'Modality': 'transcriptomics',
  'Species': 'Rattus norvegicus|NCBITaxon:10116',
  'Sex': 'female|PATO:0000383',
  'Keywords': 'Rat Intracardiac Neurons, Single Neuron Transcriptomics, Molecular Phenotype Gradients of Cell Types, Laser Capture Microdissection',
  'Subject Count': '1',
  'Folder Name': '<a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03">Shivkumar_OT2OD023848_MolecularPhenotypeDistributionofSingleRatICNNurons_2019</a>',
  'Dataset Completeness Index': '# of directories: 247; # of files: 2806; bytes: 26132511221',
  'Protocols.io': 'https://www.protocols.io/view/molecular-phenotype-distribution-of-single-rat-icn-w56fg9e',
  'Sample Count': '159',
  'Article DOI': '',
  'Example Image': '149',
  'Contributor Count': '7',
  'Completeness': 'batch',
  'Acknowledgement': '',
  'Links': ' ',
  'Age Category': 'post-juvenile adult stage|UBERON:0000113',
  'BlackfynnID': '<a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03">N:dataset:0170271a-8fac-4769-a8f5-2b9520291d03</a>',
  'Dataset Status': 'released',
  'v_uuid': '1c697034-e06d-5ee4-b03c-f7870eafd2fe'
}



var d2 = {
  'Dataset Title': 'Quantification of CTB in coeliac, nodose and dorsal root ganglia 1 week after  intrapancreatic injection <a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:78e5602a-98a8-4323-8efd-db77466030c3">Link</a>',
  'Investigators': 'Li Rosemary: https://orcid.org/0000-0002-2605-634X, Jimenez-Gonzalez Maria: https://orcid.org/0000-0002-7678-9058, Stanley Sarah: https://orcid.org/0000-0002-0253-2663',
  'Award Number': 'OT2OD024912',
  'Description': 'The neuronal tracer Cholera Toxin Subunit Beta (CTb) conjugated with a fluorophore (AlexaFluor 488) is injected in the parenchyma of the pancreas. 1 week later neuronal ganglia, including Nodoses, Coeliac and thoracic Dorsal Root Ganglia are harvested. Tissue clearing and staining for CTb is performed using Idisco protocol. Image acquisition is done utilizing a confocal microscope. Further, quantification of CTb positive neurons is assessed using IMARIS software.',
  'Anatomy': 'pancreas | UBERON:0001264, celiac ganglion | UBERON:0002262, abdominal wall | UBERON:0003697, inferior vagus X ganglion | UBERON:0005363, blood | UBERON:0000178, heart right ventricle | UBERON:0002080, liver | UBERON:0002107, dorsal root ganglion | UBERON:0000044, suture | UBERON:4200215, tissue | UBERON:0000479, diaphragm | UBERON:0001103, abdominal cavity | UBERON:0003684',
  'Modality': 'anatomy',
  'Species': '',
  'Sex': 'male|PATO:0000384',
  'Keywords': 'Peripheral Neuronal Ganglia, Retrograde tracing, Idisco, Innervation',
  'Subject Count': '12',
  'Folder Name': '<a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:78e5602a-98a8-4323-8efd-db77466030c3">JimenezGonzalez_OT2OD024912_CTbIntrapancreatic_2019</a>',
  'Dataset Completeness Index': '# of directories: 19; # of files: 70; bytes: 1694099580',
  'Protocols.io': 'https://www.protocols.io/private/D327A68038D5B4ECB32964C22D904269,https://www.protocols.io/private/F14F67958B7654CED84A3BF8B40EAA4B',
  'Sample Count': '62',
  'Article DOI': '',
  'Example Image': '',
  'Contributor Count': '3',
  'Completeness': 'Complete',
  'Acknowledgement': '',
  'Links': ' ',
  'Age Category': 'adult organism|UBERON:0007023',
  'BlackfynnID': '<a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:78e5602a-98a8-4323-8efd-db77466030c3">N:dataset:78e5602a-98a8-4323-8efd-db77466030c3</a>',
  'Dataset Status': 'embargoed',
  'v_uuid': '64770045-f115-5b3b-84ab-bb94ce24a806'
}



var d3 = {
  'Dataset Title': 'MGH_Concha_Stimulation_fMRI_Processed_Data <a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:6f657e63-735b-4ef0-9f31-06b8c2077703">Link</a>',
  'Investigators': '',
  'Award Number': 'OT2OD023867',
  'Description': '',
  'Anatomy': 'heart | UBERON:0000948',
  'Modality': 'behavioral, electrophysiology',
  'Species': '',
  'Sex': '',
  'Keywords': '',
  'Subject Count': '',
  'Folder Name': '<a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:6f657e63-735b-4ef0-9f31-06b8c2077703">MGH_Concha_Stimulation_fMRI_Processed_Data</a>',
  'Dataset Completeness Index': '',
  'Protocols.io': '',
  'Sample Count': '',
  'Article DOI': '',
  'Example Image': '',
  'Contributor Count': '',
  'Completeness': '',
  'Acknowledgement': '',
  'Links': ' ',
  'Age Category': '',
  'BlackfynnID': '<a class="external" target="_blank" href="https://app.blackfynn.io/N:organization:618e8dd9-f8d2-4dc4-9abb-c6aaab2e78a0/datasets/N:dataset:6f657e63-735b-4ef0-9f31-06b8c2077703">N:dataset:6f657e63-735b-4ef0-9f31-06b8c2077703</a>',
  'Dataset Status': 'embargoed',
  'v_uuid': '7ab53fb7-aadf-591c-8a18-137bfa7430a9'
}

var datas = [d1, d2, d3]



var container = parent.querySelector("#mapcore_search_results_list")
kb_query.renderResult(container, d1)
kb_query.renderResult(container, d2)
kb_query.renderResult(container, d3)


}

window.document.addEventListener('DOMContentLoaded', main);
