#!/usr/bin/env node
"use strict";
const fs = require('fs');
let program = require('commander');
var properties = require ("properties");
program
  .version('0.7.6')
  .option('-v, --verbose', 'verbose output')
  .option('-n, --name <s>', 'set name (required)')
  .option('-g, --group [s]', 'set component group (defaults to .hidden)')
  .option('-t, --title [s]', 'set title (optional)')
  .option('-d, --directory [s]', 'root directory (optional)')
  .option('-c, --classic', 'create classic dialog')
  .option('-l, --clientlib', 'create component client-lib')
  .parse(process.argv);
let path = program.name;
// Templates
let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:description="${program.title || program.name}"
    jcr:primaryType="cq:Component"
    jcr:title="${program.title || program.name}"
    sling:resourceSuperType="foundation/components/parbase"
    allowedParents="[*/parsys]"
    componentGroup="${program.group || `.hidden`}"/>`;
let dialog = `<?xml version="1.0" encoding="UTF-8"?>
  <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
      jcr:primaryType="nt:unstructured"
      jcr:title="${program.title || program.name}"
      sling:resourceType="cq/gui/components/authoring/dialog">
      <content
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/foundation/container">
          <layout
              jcr:primaryType="nt:unstructured"
              sling:resourceType="granite/ui/components/foundation/layouts/tabs"
              type="nav"/>
          <items jcr:primaryType="nt:unstructured">
              <${program.name}
                  jcr:primaryType="nt:unstructured"
                  jcr:title="${program.title || program.name} Properties"
                  sling:resourceType="granite/ui/components/foundation/section">
                  <layout
                      jcr:primaryType="nt:unstructured"
                      sling:resourceType="granite/ui/components/foundation/layouts/fixedcolumns"/>
                  <items jcr:primaryType="nt:unstructured">
                  </items>
              </${program.name}>
          </items>
      </content>
  </jcr:root>`;

let classic = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:Dialog"
    title="dialog"
    xtype="dialog">
    <items jcr:primaryType="cq:WidgetCollection">
        <${program.name}
            jcr:primaryType="cq:Widget"
            title="${program.title || program.name}"
            xtype="panel">
            <items jcr:primaryType="cq:WidgetCollection">
            </items>
        </${program.name}>
    </items>
</jcr:root>`;
let clientlib = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    categories="[${program.name}]"/>`;
let html = `<div></div>`;
// Function to write to a file
let write = (file,text) => {
  fs.writeFile(file, text, (err) => {
    if (err) throw err;
    if(program.verbose) console.log(`${file} is saved!`);
  });
};
// Main Function
let create = () => {
  write(`${path}/.content.xml`,xml);
  // Decides on dialog
  if(program.classic) {
    write(`${path}/dialog.xml`,classic);
  } else {
    write(`${path}/_cq_dialog.xml`,dialog);
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
      write(`${clientlibFolder}.content.xml`,clientlib);
      createClientLib('js');
      createClientLib('css');
    });
  }
};
// Checks Values
let check = () => {
  if(!program.name) {
    console.log(`Error: you have not specified the component name.`);
    program.help();
  }

  if(program.directory){
    if(!program.directory.endsWith('/')) program.directory += '/';
    path = program.directory + program.name;
  }
  fs.mkdir(path,create);
};
// Processes Arguments
fs.access("aem.config", fs.F_OK, function(err) {
  if (!err) {
    properties.parse("aem.config", { path: true }, function (error, obj){
      if (error) return console.error (error);
      program.directory = (program.directory || obj.directory);
      program.group = (program.group || obj.group);
      check();
    });
  } else {
    if(err.code === 'ENOENT') {
      check();
    } else {
      return console.error(err);
    }

  }
});
