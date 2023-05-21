import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: '../tsconfig.json',
  compilerOptions: { outDir: 'dist', declaration: true }
});
// project.emit(); // async

project.emitSync();
