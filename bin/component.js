#!/usr/bin/env node
"use strict";
const fs = require('fs');
let program = require('commander');
program
  .version('0.8.0')
  .option('-v, --verbose', 'verbose output')
  .option('-n, --name <s>', 'set name (required)')
  .option('-g, --group [s]', 'set component group (defaults to .hidden)')
  .option('-t, --title [s]', 'set title (optional)')
  .option('-d, --directory [s]', 'root directory (optional)')
  .option('-c, --classic', 'create classic dialog')
  .option('-l, --clientlib', 'create component client-lib')
  .parse(process.argv);
let path = program.name;
// Function to write to a file
let write = (file,text) => {
  fs.writeFile(file, text, (err) => {
    if (err) throw err;
    if(program.verbose) console.log(`${file} is saved!`);
  });
};
// Main Function
let create = () => {
  write(`${path}/.content.xml`,xml(program));
  write(`${path}/_cq_editConfig.xml`,cqEdit);
  // Decides on dialog
  if(program.classic) {
    write(`${path}/dialog.xml`,classic(program));
  } else {
    write(`${path}/_cq_dialog.xml`,dialog(program));
  }
  write(`${path}/${program.name}.html`,html);
  // If clientlib, will write dummy clientlib.
  if(program.clientlib) {
    let clientlibFolder = `${path}/clientlib/`;
    fs.mkdir(clientlibFolder,() => {
      let createClientLib = (type) => {
        let name = `${clientlibFolder}${type}`;
        fs.mkdirSync(name);
        write(`${name}.txt`,`#base=${type}`);
      };
      write(`${clientlibFolder}.content.xml`,clientlib(program));
      createClientLib('js');
      createClientLib('css');
    });
  }
};
// Checks Values
let check = () => {
  if(!program.name || typeof program.name != "string") {
    console.log(`Error: you have not specified the component name.`);
    program.help();
  }

  if(program.directory){
    if(!program.directory.endsWith('/')) program.directory += '/';
    path = program.directory + program.name;
  }
  fs.mkdir(path,create);
};
check();

// Templates
let xml = (item) => `<?xml version="1.0" encoding="UTF-8"?>
  <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:description="${item.title || item.name}"
    jcr:primaryType="cq:Component"
    jcr:title="${item.title || item.name}"
    sling:resourceSuperType="foundation/components/parbase"
    allowedParents="[*/parsys]"
    componentGroup="${item.group || `.hidden`}"/>`;
let dialog = (item) => `<?xml version="1.0" encoding="UTF-8"?>
  <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
      jcr:primaryType="nt:unstructured"
      jcr:title="${item.title || item.name}"
      sling:resourceType="cq/gui/components/authoring/dialog">
      <content
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/foundation/container">
          <layout
              jcr:primaryType="nt:unstructured"
              sling:resourceType="granite/ui/components/foundation/layouts/tabs"
              type="nav"/>
          <items jcr:primaryType="nt:unstructured">
              <${item.name}
                  jcr:primaryType="nt:unstructured"
                  jcr:title="${item.title || item.name} Properties"
                  sling:resourceType="granite/ui/components/foundation/section">
                  <layout
                      jcr:primaryType="nt:unstructured"
                      sling:resourceType="granite/ui/components/foundation/layouts/fixedcolumns"/>
                  <items jcr:primaryType="nt:unstructured">
                  </items>
              </${item.name}>
          </items>
      </content>
  </jcr:root>`;
let cqEdit = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
  jcr:primaryType="cq:EditConfig">
</jcr:root>`;
let classic = (item) => `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:Dialog"
    title="dialog"
    xtype="dialog">
    <items jcr:primaryType="cq:WidgetCollection">
        <${item.name}
            jcr:primaryType="cq:Widget"
            title="${item.title || item.name}"
            xtype="panel">
            <items jcr:primaryType="cq:WidgetCollection">
            </items>
        </${item.name}>
    </items>
</jcr:root>`;
let clientlib = (item) => `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    categories="[${item.name}]"/>`;
let html = `<div></div>`;
