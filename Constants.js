const Constants = {
    PORT: 4005,
    CORS_METHODS: ["GET", "POST"],
    CORS_ORIGIN:'http://localhost:3000',
    REGISTER_COMPLETE:'REGISTER_COMPLETE',
    DEFAULT_REGISTER_FAILURE:'This user already exists',

    GET_SALT:'get salt',
    SALT_COMPLETE:'salt complete',
    LOGIN_ATTEMPT:'login attempt',
    REGISTER_ATTEMPT:'register attempt',
    LOGIN_COMPLETE:'login complete', 

    START_STREAM:'start stream',
    END_STREAM:'end stream',
    JOIN_STREAM_REQUEST:'join stream request',

    SEND_WEBRTC_CONNECTION_REQUEST:'Send request for webrtc connection',

    MESSAGE:'message'

}

module.exports = Constants