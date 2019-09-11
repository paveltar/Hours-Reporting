var xlsx = require('node-xlsx').default
var moment = require('moment')

const workSheetsFromFile = xlsx.parse(`${__dirname}/report.xlsx`);

const { data } = workSheetsFromFile[0]

const dateFormat = 'DD/MM/YYYY'
const timeFormat = 'HH:mm'

const parseXlsTime = xlsTime => moment.duration(parseInt(Math.ceil(xlsTime * 24 * 60 * 10) / 10), 'minutes')
const zeroPadding = (value, padding, paddWith = '0') => value.length < padding ? `${paddWith.repeat(padding - value.length)}${value}` : value
const printReadable = duration => `${duration.hours()}:${zeroPadding(String(duration.minutes()), 2)}`

const mapDaysToReadableFormat = ({ date, start, finish, hoursWorked, extraWorkedHours }) => ({
    date: date.format(dateFormat),
    start: start.format(timeFormat),
    finish: finish.format(timeFormat),
    hoursWorked: printReadable(hoursWorked),
    extraWorkedHours: printReadable(extraWorkedHours),
})

const parsedDays = []

const hoursPerDay = 9
const hoursPerDayThursday = 8.5

data.slice(1, data.length).forEach(item => {

    // needs both!!
    if (!item[6] || !item[7]) return

    const date = moment(item[3], dateFormat)

    const start = moment(`${date.format(dateFormat)} ${printReadable(parseXlsTime(item[6]))}`, `${dateFormat} ${timeFormat}`)
    const finish = moment(`${date.format(dateFormat)} ${printReadable(parseXlsTime(item[7]))}`, `${dateFormat} ${timeFormat}`)

    const hoursWorked = moment.duration(finish.diff(start), 'ms')
    const timeToLeave = start.clone().add(date.day() === 4 ? hoursPerDayThursday : hoursPerDay, 'hours')

    const extraWorkedHours = moment.duration(finish.diff(timeToLeave), 'ms')

    parsedDays.push({
        date,
        start,
        finish,
        hoursWorked,
        extraWorkedHours,
    })
})

const getTotalHours = param => parsedDays.reduce((total, value, index) => {
    if (index === 0) return total
    return total.add(value[param])
}, parsedDays[0][param].clone())

const report = {
    parsedDays: parsedDays.map(mapDaysToReadableFormat),
    totalExtraWorkedHours: getTotalHours('extraWorkedHours').asHours(),
    totalHoursWorked: getTotalHours('hoursWorked').asHours(),
    dayCounted: parsedDays.length
}

console.log(report)
