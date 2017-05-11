const Show = require('./src/models/dater').Show

const carmenData = require('./static/data/120-carmen.json')
const trompeData = require('./static/data/121-trompe-la-mort.json')
const filleData = require('./static/data/124-la-fille-de-neige.json')
const wozzeckData = require('./static/data/125-wozzeck.json')
const eugeneData = require('./static/data/126-eugene-oneguine.json')
const rigolettoData = require('./static/data/127-rigoletto.json')
const cenerentolaData = require('./static/data/128-la-cenerentola.json')

try {
  data = [
    new Show(carmenData),
    new Show(trompeData),
    new Show(filleData),
    new Show(wozzeckData),
    new Show(eugeneData),
    new Show(rigolettoData),
    new Show(cenerentolaData)
  ]
  data.forEach(show => {
    let [minPrice, minPerfs] = show.getCheapestCurrentPerformances()
    console.log(show.title, minPrice, minPerfs, show.getCheapestTs())
  })
} catch(err) {
  console.log(err)
}


