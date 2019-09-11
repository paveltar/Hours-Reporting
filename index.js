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

const constraints = {
    halfHoliday: {
        // values: ['08/09/2019'],
        amount: 4.5
    },
    vacations: {
        // values: ['10/09/2019'],
        amount: 0,
    },
    regularDay: {
        values: [0, 1, 2, 3],
        amount: 9
    },
    thursday: {
        values: [4], // 4th day of the week
        amount: 8.5
    }
}

const getHoursToWork = date => {

    dayOfTheWeek = date.day()
    formatedDate = date.format(dateFormat)

    // Object.keys(constraints).forEach(key => {
    //     const { values, amount } = constraints[key]
    //     if (values.includes(dayOfTheWeek) || values.includes(formatedDate)) {
    //         hoursToWork = amount
    //     }
    // })

    for (const key in constraints) {
        if (constraints.hasOwnProperty(key)) {
            const { values, amount } = constraints[key]
            if (values && !isNaN(amount) && (values.includes(dayOfTheWeek) || values.includes(formatedDate))) return amount
        }
    }

    return constraints.regularDay.amount
}

const parsedDays = []

data.slice(1, data.length).forEach(item => {

    // needs both!!
    if (!item[6] || !item[7]) return

    const date = moment(item[3], dateFormat)

    const start = moment(`${date.format(dateFormat)} ${printReadable(parseXlsTime(item[6]))}`, `${dateFormat} ${timeFormat}`)
    const finish = moment(`${date.format(dateFormat)} ${printReadable(parseXlsTime(item[7]))}`, `${dateFormat} ${timeFormat}`)

    const hoursWorked = moment.duration(finish.diff(start), 'ms')

    const timeToLeave = start.clone().add(getHoursToWork(date), 'hours')

    // console.log(getHoursToWork(date))

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
