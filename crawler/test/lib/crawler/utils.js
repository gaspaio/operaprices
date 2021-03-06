const assert = require('chai').assert
const utils = require('../../lib/crawler/utils.js')

describe('Crawler utils', () => {
  describe('locationString', () => {
    it('parses locations like "Opéra Bastille — du 09 septembre au 21 octobre 2017"', done => {
      const [start, end, loc] = utils.locationString('Opéra Bastille — du 09 septembre au 21 octobre 2017')
      assert.strictEqual(loc, 'Opéra Bastille')
      assert.strictEqual(start, 1504958400)
      assert.strictEqual(end, 1508587200)

      done()
    })

    it('parses locations like "Amphithéâtre Bastille — du 02 au 11 novembre 2017"', done => {
      const [start, end, loc] = utils.locationString('Amphithéâtre Bastille — du 02 au 11 novembre 2017')
      assert.strictEqual(loc, 'Amphithéâtre Bastille')
      assert.strictEqual(start, 1509624000)
      assert.strictEqual(end, 1510401600)

      done()
    })

    it('parses locations like "Palais Garnier — le 24 septembre 2016 à 19h30"', done => {
      const [start, end, loc] = utils.locationString('Palais Garnier — le 24 septembre 2016 à 19h30')
      assert.strictEqual(loc, 'Palais Garnier')
      assert.strictEqual(start, 1474718400)
      assert.strictEqual(end, 1474718400)

      done()
    })

    it('parses locations like "Amphithéâtre Bastille — du 10 septembre 2016 au 10 juin 2017"', done => {
      const [start, end, loc] = utils.locationString('Amphithéâtre Bastille — du 10 septembre 2016 au 10 juin 2017')
      assert.strictEqual(loc, 'Amphithéâtre Bastille')
      assert.strictEqual(start, 1473508800)
      assert.strictEqual(end, 1497096000)

      done()
    })

    it('throws exceptions if the location string is not in one of the expected formats', done => {
      assert.throws(() => { utils.locationString('Some place - 12/04/2017') }, Error)
      done()
    })
  })

  describe('performanceDate', () => {
    it('parses performance dates like "dimanche 16 juillet 2017" " 19h30"', done => {
      const time = utils.performanceDate('dimanche 16 juillet 2017', ' 19h30')
      assert.strictEqual(time, 1500226200)
      done()
    })
  })

  describe('link2slug', () => {
    it('gets the slug from urls like "https://www.operadeparis.fr/saison-16-17/opera/eugene-oneguine"', done => {
      const slug = utils.link2slug('https://www.operadeparis.fr/saison-16-17/opera/eugene-oneguine')
      assert.strictEqual(slug, 'eugene-oneguine')
      done()
    })

    it('throws exceptions if the url is not in the expected format', done => {
      assert.throws(() => { utils.locationString('https://www.operadeparis.fr/eugene-oneguine') }, Error)
      done()
    })
  })
})
