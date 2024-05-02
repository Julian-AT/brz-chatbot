import RawStations from '@/public/data/wl.json'

interface Station {
  stationID: string
  relatedLines: string
  latitude: string
  name: string
  longitude: string
  platforms: Platform[]
}

interface Platform {
  line: string
  rbl: string
  latitude: string
  longitude: string
}

const Stations = RawStations as Station[]

export const extractStationNames = async (): Promise<Station[]> => {
  console.log(Stations.length)

  return Stations.filter(station => station.name)
}
