module.exports = {
    getMessageDate(message, username){
        return {
            "text":message,
            "username":username,
            "deliveredAt":new Date().getTime()
        }
    },
    getUrlDate(url, username){
        return {
            url:url,
            username:username,
            deliveredAt:new Date().getTime()
        }
    }
}