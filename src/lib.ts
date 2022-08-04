import _fetch, { RequestInit } from 'node-fetch'
import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

/**
 * Point type
 */
export type LatLng = number[] | { lat: number, lng: number }

/**
 * vt reverse geocoder config
 */
export type Config = {
	/** Vector tile fetch url */
	vectorTileUrl: string;
	/** max zooming to search tile */
	maxZoom: number;
  /** Transform tiles and source requests */
  transformRequest: (url: string, init?: RequestInit | undefined) => [string, RequestInit | undefined]
}

export type ZXY = [z: number, x: number, y: number]

export type ReverseGeocodeResult = {
  query: {
    point: { lat: number, lng: number };
    vectorTileUrl: string;
    zxy: ZXY | null;
  };
  data: any[];
}

export const defaultConfig: Config = {
	vectorTileUrl: '',
	maxZoom: 22,
  transformRequest: (url, init) => [url, init]
}

export const reverseGeocode = async (latlng: LatLng, config: Partial<Config> = defaultConfig): Promise<ReverseGeocodeResult> => {
	let { vectorTileUrl, maxZoom, transformRequest } = { ...defaultConfig, ...config }
  const { lat, lng } = Array.isArray(latlng) ? { lat: latlng[0], lng: latlng[1] } : latlng
	if(!vectorTileUrl) {
		throw new Error('No vector tile endpoint specified. Please set `vt` property as a config value.')
	}

  const fetch = (url: string, init: RequestInit | undefined) => _fetch(...transformRequest(url, init))

  if(
    vectorTileUrl.indexOf('{x}') === -1 ||
    vectorTileUrl.indexOf('{y}') === -1 ||
    vectorTileUrl.indexOf('{z}') === -1
  ) {
    // seems to be tile.json
    const resp = await fetch(vectorTileUrl, {})
    const body = await resp.json() as { tiles: string[] }
    const { tiles } = body
    if(!tiles || typeof tiles[0] !== 'string') {
      throw new Error('Invalid tile URL. API responses: ' + JSON.stringify(body))
    }
    vectorTileUrl = tiles[0]
  }

  let zooming = maxZoom
  let tileBuf: Buffer | undefined = undefined
  let zxy: ZXY | undefined = undefined
  while (zooming > -1) {
    const z = zooming
    const n = 2 ** z
    const x = Math.floor(n * ((lng + 180) / 360))
    const lat_rad = 2 * Math.PI * lat / 360
    const y = Math.floor(n * (1 - (Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI)) / 2)

    const theTileUrl = vectorTileUrl
      .replace('{x}', x.toString())
      .replace('{y}', y.toString())
      .replace('{z}', z.toString())
    const tileHeadResp = await fetch(theTileUrl, { method: 'HEAD' })
    console.log(tileHeadResp.status, theTileUrl)
    if(tileHeadResp.status > 399) {
      zooming--
      continue
    } else {
      const tileResp = await fetch(theTileUrl, {})
      tileBuf = Buffer.from(await tileResp.arrayBuffer())
      zxy = [z, x, y]
      break
    }
  }

  const result: ReverseGeocodeResult = {
    query: {
      point: { lat, lng },
      vectorTileUrl,
      zxy: zxy || null,
    },
    data: [],
  }
  if (!tileBuf || !zxy) {
    return result
  } else {
    const pbf = new Pbf(tileBuf)
    const { layers } = new VectorTile(pbf)

    for (const layername in layers) {
      const layer = layers[layername]
      for (let index = 0; index < layer.length; index++) {
        const [z, x, y] = zxy
        const feature = layer.feature(index).toGeoJSON(x, y, z)
        if(feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          if(booleanPointInPolygon([lng, lat], feature.geometry)) {
            result.data.push(feature.properties)
          }
        }
      }
    }

  }
  return result
}
