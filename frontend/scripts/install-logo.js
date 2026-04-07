#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const readline = require('readline')

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans) }))
}

async function main() {
  try {
    const arg = process.argv[2]
    const srcInput = arg || await ask('Path to logo file (full path): ')
    if (!srcInput) {
      console.error('No path provided, exiting.')
      process.exit(1)
    }

    const src = path.resolve(srcInput.trim())
    if (!fs.existsSync(src)) {
      console.error('Source file not found:', src)
      process.exit(1)
    }

    const ext = path.extname(src).toLowerCase() || '.png'
    const destDir = path.resolve(__dirname, '..', 'public', 'images')
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
    const destName = `CICS-seal${ext}`
    const dest = path.join(destDir, destName)

    fs.copyFileSync(src, dest)
    console.log(`Copied ${src} -> ${dest}`)

    // Update header component to point to the correct file
    const headerPath = path.resolve(__dirname, '..', 'src', 'components', 'layout', 'CICSHeader.tsx')
    if (fs.existsSync(headerPath)) {
      let content = fs.readFileSync(headerPath, 'utf8')
      // Replace any existing reference to CICS-seal.* with the new extension
      content = content.replace(/src=(['"])\/images\/CICS-seal\.[^'\"]+\1/, `src=$1/images/${destName}$1`)
      fs.writeFileSync(headerPath, content, 'utf8')
      console.log('Updated header to reference /images/' + destName)
    } else {
      console.warn('Header component not found at', headerPath, '\nYou may need to update the image src manually.')
    }

    console.log('Done. Restart your dev server if it is running.')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

main()
