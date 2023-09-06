const moment = require('moment')

// public methods
module.exports = {

    getDate: function(timestamp) {
        const timestampNumber = Number(timestamp * 1000)
        const momentDate = moment(new Date(timestampNumber))
        return momentDate.format('YYYY-MM-DDTHH:mm:ssZZ')
    },
  
    getWeekdayAndHourStr: function(date) {
        return new Date(date).getHours() + ' ' + moment(date).format('ddd')
    },

    findIndexWithDate: function(datePriceArray, date) {
        for (let i = 0; i < datePriceArray.length; i++) {
          if (datePriceArray[i].start === date) {
            return i
          }
        }
        return undefined
    },

    getTodaySpanStart: function() {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    },

    getTodaySpanEnd: function() {
        const date = new Date()
        date.setHours(24, 0, 0, 0)
        date.setMilliseconds(date.getMilliseconds() - 1)
        return date.toISOString()
    },
      
    getTomorrowSpanStart: function() {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    },
      
    getTomorrowSpanEnd: function() {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(24, 0, 0, 0)
        date.setMilliseconds(date.getMilliseconds() - 1)
        return date.toISOString()
    },

    sortByDate: function(array) {
        array.sort((a, b) => {
            if (a.start > b.start) return 1
            else if (a.start < b.start) return -1
            else return 0
        })
    }

  };
  
  // private methods
  var zemba = function () {
  }