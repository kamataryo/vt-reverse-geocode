# vt-reverse-geocode

A reverse geocoder with Vector tile.

## Usage

### As a npm

```javascript
import { reverseGeocode } from 'vt-reverse-geocode'

(async () => {
  try {
    const result = await reverseGeocode([35, 140], { vectorTileUrl: 'https://kamataryo.github.io/eez-explorer/tiles/{z}/{x}/{y}.mvt' })
    console.log(result)
  } catch (error) {
    console.error(error)
  }
})()
```

#### Options

```typescript
{
  /** Vector tile fetch url */
  vectorTileUrl?: string;
  /** max zooming to search tile */
  maxZoom?: number;
  /** Transform tiles and source requests */
  transformRequest?: (url: string, init?: RequestInit | undefined) => [string, RequestInit | undefined]
}
```

### As a CLI

```shell
$ npx vt-reverse-geocode --help
Usage: vt-reverse-geocode [options] <lat> <lng>

A reverse geocoder with vector tile.

Arguments:
  lat                          Numeric latitude value.
  lng                          Numeric longitude value.

Options:
  -V, --version                output the version number
  -u, --vector-tile-url <url>  Vector tile URL like
                               https://example.com/{z}/{x}/{y}.mvt.
  -z, --max-zoom
  -h, --header-json
  --help                       display help for command
```

#### examples

```shell
$ npx vt-reverse-geocode 35 140 -u 'https://kamataryo.github.io/eez-explorer/tiles/{z}/{x}/{y}.mvt'
{
  query: {
    point: { lat: 35, lng: 140 },
    vectorTileUrl: 'https://kamataryo.github.io/eez-explorer/tiles/{z}/{x}/{y}.mvt',
    zxy: [ 4, 14, 6 ]
  },
  data: [
    {
      MRGID: 8487,
      GEONAME: 'Japanese Exclusive Economic Zone',
      TERRITORY1: 'Japan',
      ...
    }
  ]
}
```

```shell
# max zoom option
$ npx vt-reverse-geocode 35 140 -z 1 -u 'https://kamataryo.github.io/eez-explorer/tiles/{z}/{x}/{y}.mvt'
{
  query: {
    point: { lat: 35, lng: 140 },
    vectorTileUrl: 'https://kamataryo.github.io/eez-explorer/tiles/{z}/{x}/{y}.mvt',
    zxy: [ 1, 1, 0 ]
  },
  data: [
    {
      MRGID: 8487,
      GEONAME: 'Japanese Exclusive Economic Zone',
      TERRITORY1: 'Japan',
      ...
    }
  ]
}
```
