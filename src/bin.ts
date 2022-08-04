import { Config, reverseGeocode } from './lib.js'
import { program } from 'commander'
import { pkg } from './package.js'

program
  .name('vt-reverse-geocode')
  .description(pkg.description)
  .version(pkg.version)
  .argument('<lat>', 'Numeric latitude value.')
  .argument('<lng>', 'Numeric longitude value.')
  .requiredOption('-u, --vector-tile-url <url>', 'Vector tile URL like https://example.com/{z}/{x}/{y}.mvt.')
  .option('-z, --max-zoom <max-zoom>')
  .action(async (arg1, arg2, cliOptions) => {

    const lat = parseFloat(arg1)
    const lng = parseFloat(arg2)

    if(Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error(`Invalid latitude or longitude values, ${JSON.stringify({ lat: arg1, lng: arg2 })}.`)
      process.exit(1)
    }

    const { vectorTileUrl, maxZoom: maxZoomStr, headerJson } = cliOptions
    const libOptions: Partial<Config> = {}

    if(typeof vectorTileUrl !== 'string') {
      console.error(`Invalid vecror tile url option, ${vectorTileUrl}.`)
      process.exit(2)
    }
    if(typeof vectorTileUrl === 'string') {
      libOptions.vectorTileUrl = vectorTileUrl
    }

    let maxZoom: number | undefined = undefined
    if(typeof maxZoomStr !== 'undefined') {
      maxZoom = parseInt(maxZoomStr, 10)
      if(Number.isNaN(maxZoom)) {
        console.error(`Invalid max zoom option, ${maxZoomStr}`)
        process.exit(3)
      }
    }
    if(typeof maxZoom === 'number') {
      libOptions.maxZoom = maxZoom
    }

    try {
      const result = await reverseGeocode([lat, lng], libOptions)
      console.log(result)
    } catch (error) {
      console.error(error)
      process.exit(5)
    }
  })

program.parse()
