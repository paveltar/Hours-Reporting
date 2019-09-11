// 34251_Export20190910_192054861.xlsx

var xlsx = require('node-xlsx').default
var moment = require('moment')

const workSheetsFromFile = xlsx.parse(`${__dirname}/report.xlsx`);

const {data} = workSheetsFromFile[0]

const momentFormat = 'DD/MM/YYYY'

const mathRound = value => parseInt(Math.ceil(value * 10) / 10)
const parseXlsTime = xlsTime => moment.duration(parseInt(Math.ceil(xlsTime * 24 * 60 * 10) / 10), 'minutes')
const zeroPadding = (value, padding, paddWith = '0') => value.length < padding ? `${paddWith.repeat(padding - value.length)}${value}` : value
const printReadable = duration => `${duration.hours()}:${zeroPadding(String(duration.minutes()), 2)}`

const parsedData = []

const hoursPerDay = 9
const hoursPerDayThursday = 8.5

data.slice(1, data.length).forEach(item => {

    // needs both!!
    if (!item[6] || !item[7]) return

    const date = moment(item[3], momentFormat)
    const start = parseXlsTime(item[6])
    const finish = parseXlsTime(item[7])

    const diffInSeconds = finish.asSeconds() - start.asSeconds()
    const total = moment.duration(diffInSeconds, 'seconds')

    // const extraHours = moment.duration(total.asHours() - (date.day() === 4 ? hoursPerDayThursday : hoursPerDay), 'hours')

    parsedData.push({
        date: date.format(momentFormat),
        start: printReadable(start), 
        finish: printReadable(finish),
        total: printReadable(total),
        // extraHours: printReadable(extraHours),
    })

})

console.log(parsedData)
