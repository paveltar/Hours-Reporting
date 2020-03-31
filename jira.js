const axios = require('axios')
const moment = require('moment')
const parsedDays = require('.')

const headers = {
    // you headers goes here
}

const staticData = {
    attributes: {
        _Account_: {
            workAttributeId: 1,
            value: '<<SECRET_VALUE>>'
        }
    },
    billableSeconds: '',
    workerId: '<<SECRET_VALUE>>',
    originTaskId: '<<SECRET_VALUE>>',
    remainingEstimate: null,
    endDate: null,
    includeNonWorkingDays: false,
}

const app = axios.create({
    headers,
    baseURL: 'https://app.tempo.io/rest/tempo-timesheets/4/',
})

// TODO: convert to Promise.all
const start = async () => {
    const promises = []
    for (let i = 0; i < parsedDays.length; i++) {
        const { start, timeWorked, date } = parsedDays[i]
        const data = {
            comment: 'working', // add your comment here
            started: start.format('YYYY-MM-DDTHH:mm:ss.SSS'),
            timeSpentSeconds: timeWorked.asSeconds(),
        }
        const request = {
            url: 'worklogs',
            method: 'post',
            data: {
                ...staticData,
                ...data,
            }
        }

        // // in case you want to dismiss days before specific date
        // if (date.diff(moment('26/10/2019', 'DD/MM/YYYY'), 'days') <= 0) continue

        promises.push(app(request))
    }

    const responses = await Promise.all(promises)
    responses.forEach(res => {
        console.log(res.status)
    })
}

const removeAllEntries = async month => {
    const request = {
        url: 'worklogs/search',
        method: 'post',
        data: {
            from: moment(month, 'MMMM').startOf('month').format('YYYY-MM-DD'),
            to: moment(month, 'MMMM').endOf('month').format('YYYY-MM-DD'),
            workerId: [staticData.workerId]
        }
    }

    const response = await app(request)
    const promises = []

    for (let i = 0; i < response.data.length; i++) {
        const item = response.data[i]

        const deleteRequest = {
            url: `worklogs/${item.tempoWorklogId}`,
            method: 'delete',
        }

        promises.push(app(deleteRequest))

    }

    const responses = await Promise.all(promises)

    responses.forEach(res => {
        console.log(res.status)
    })

}

start()

// removeAllEntries('october')  // may be some problem with headers depending of which function you're using