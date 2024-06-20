const moment = require('moment');

function formatMessage(username, text, color = '#000'){
    return{
        username,
        text,
        color,
        time: moment().format('h:mm a')
    }
}

module.exports= formatMessage;