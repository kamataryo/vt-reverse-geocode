// @file generate package.ts from package.json

import fs from 'fs/promises'

const main = async () => {
  const pkg = JSON.parse(await fs.readFile('./package.json'))
  const pkgModlue = `// This is an automatilally generated file.
export const pkg = { version: "${pkg.version}", description: "${pkg.description}" }`
  await fs.writeFile('./src/package.ts', pkgModlue)
}

main()
