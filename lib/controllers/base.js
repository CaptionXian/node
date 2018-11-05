const AsyncEventEmitter = require('async-eventemitter')

class BaseCtrl extends AsyncEventEmitter {
  emit () {
    try {
      return super.emit(...arguments)
    } catch (error) {
      return console.log(error)
    }
  }
}

const baseCtrl = new BaseCtrl()
baseCtrl.Base = BaseCtrl
module.exports = baseCtrl
