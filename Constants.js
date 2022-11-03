const Constants = {
    PORT: 4005,
    CORS_METHODS: ["GET", "POST"],
    CORS_ORIGIN:'http://localhost:3000',
    SUCCESSFUL_CONNECTION:'connection success',

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
    JOIN_STREAM_RESULT:'join stream result',
    REQUEST_STREAMS:'request streams',
    REQUEST_STREAMS_ACK:'ackknowledge requested streams',
    NEW_STREAM:'new stream',
    STREAM_ENDED: 'stream ended',

    NEW_SUBSCRIPTION:'new subscription',


    WEBRTC_CONNECTION_REQUEST:'Send request for webrtc connection',
    CANDIDATE:'candidate',
    OFFER:'offer',
    ANSWER:'answer',
    MESSAGE:'message',
    ICE_SERVERS: {
        'iceServer': [
            {'urls': 'stun:stun.services.mozilla.com'},
            {'urls': 'stun:stun.l.google.com:19302'}
        ]
    },


    MESSAGE:'message'

}

module.exports = Constants