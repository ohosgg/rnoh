import fs from 'fs';
import pathUtils from 'path';

export type FileStructure = { [key: string]: string | FileStructure };

export function createFileStructure(
  rootPath: string,
  fileStructure: FileStructure
) {
  for (const [name, content] of Object.entries(fileStructure)) {
    if (typeof content === 'string') {
      fs.writeFileSync(pathUtils.join(rootPath, name), content);
    } else {
      fs.mkdirSync(pathUtils.join(rootPath, name));
      createFileStructure(pathUtils.join(rootPath, name), content);
    }
  }
}

export function buildDirTree(dirPath: string, indent = '') {
  let tree = '';

  const files = fs.readdirSync(dirPath);

  files.forEach((file, index) => {
    const filePath = pathUtils.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      tree += `${indent}└── ${file} (folder)\n`;
      tree += buildDirTree(filePath, `${indent}    `);
    } else {
      const fileContent = fs
        .readFileSync(filePath, { encoding: 'utf-8' })
        .substring(0, 48);
      tree += `${indent}└── ${file}: ${fileContent}\n`;
    }

    if (index === files.length - 1) {
      tree += '\n';
    }
  });

  return tree;
}
