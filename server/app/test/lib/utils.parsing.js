const assert = require('chai').assert
const utils = require('../../lib/utils.parsing.js')

describe('Parsing utils', () => {
  describe('parseLocationString', () => {
    it('parses locations like "Opéra Bastille — du 09 septembre au 21 octobre 2017"', done => {
      const [start, end, loc] = utils.parseLocationString('Opéra Bastille — du 09 septembre au 21 octobre 2017')
      assert.strictEqual(loc, 'Opéra Bastille')
      assert.strictEqual(start, 1504958400)
      assert.strictEqual(end, 1508587200)

      done()
    })

    it('parses locations like "Amphithéâtre Bastille — du 02 au 11 novembre 2017"', done => {
      const [start, end, loc] = utils.parseLocationString('Amphithéâtre Bastille — du 02 au 11 novembre 2017')
      assert.strictEqual(loc, 'Amphithéâtre Bastille')
      assert.strictEqual(start, 1509624000)
      assert.strictEqual(end, 1510401600)

      done()
    })

    it('parses locations like "Palais Garnier — le 24 septembre 2016 à 19h30"', done => {
      const [start, end, loc] = utils.parseLocationString('Palais Garnier — le 24 septembre 2016 à 19h30')
      assert.strictEqual(loc, 'Palais Garnier')
      assert.strictEqual(start, 1474718400)
      assert.strictEqual(end, 1474718400)

      done()
    })

    it('parses locations like "Amphithéâtre Bastille — du 10 septembre 2016 au 10 juin 2017"', done => {
      const [start, end, loc] = utils.parseLocationString('Amphithéâtre Bastille — du 10 septembre 2016 au 10 juin 2017')
      assert.strictEqual(loc, 'Amphithéâtre Bastille')
      assert.strictEqual(start, 1473508800)
      assert.strictEqual(end, 1497096000)

      done()
    })

    it('throws exceptions if the location string is not in one of the expected formats', done => {
      assert.throws(() => {utils.parseLocationString('Some place - 12/04/2017')}, Error);
      done()
    })
  })
})
