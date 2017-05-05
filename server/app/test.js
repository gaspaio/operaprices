const Rx = require('rx')
const inspect = require('util').inspect

const data = [1,2]


const source = Rx.Observable.from(data)
  .flatMap(d => {
    if (d == 1) return Rx.Observable.empty()
    return Rx.Observable.just(d)
  })
  .flatMap(x => {
    console.log("received", x)
    return x + 1
  })

source.subscribe(
  x => console.log('onNext:', inspect(x)),
  e => console.log('onError -: %s', e),
  () => console.log('onCompleted')
)




