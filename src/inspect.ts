import { Project, PropertySignature } from 'ts-morph';
import * as fs from 'fs';

// Initialize a new project
const project = new Project({ tsConfigFilePath: '../tsconfig.json' });

// Here, you'd add the source files you want to inspect.
// This could be one specific file, or you could add multiple files, or even an entire directory.
// In this example, we're adding a single file 'source-file.ts' which is located in the same directory.
const sourceFile = project.addSourceFileAtPath('./index.d.ts');

// You can use getInterfaces() to get all interfaces in a file.
const interfaces = sourceFile.getInterfaces();

let exportObject: { [key: string]: { [key: string]: string } } = {};

// Loop over each interface and print its name and properties
interfaces.forEach(iface => {
  const interfaceName = iface.getName();
  console.log(`Interface: ${interfaceName}`);

  exportObject[interfaceName] = {} as { [key: string]: string };

  iface.getProperties().forEach((prop: PropertySignature) => {
    const propName = prop.getName();
    const propType = prop.getType().getText();

    console.log(`  Property: ${propName} : ${propType}`);
    exportObject[interfaceName][propName] = propType;
  });
});

fs.writeFile(
  './interfaceData.js',
  `module.exports = ${JSON.stringify(exportObject, null, 2)}`,
  err => {
    if (err) throw err;
    console.log('interfaceData.js has been saved!');
  }
);
