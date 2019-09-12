const axios = require('axios')
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
const init = async () => { 
    for (let i = 0; i < parsedDays.length; i++) {
        const { start, timeWorked } = parsedDays[i]
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
        const response = await app(request)
        console.log(response)
    }
}

init()
