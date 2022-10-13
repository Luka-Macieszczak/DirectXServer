const express = require("express");
const app = express();
const Constants = require("./Constants");
const httpServer = require("http").createServer();
const addUser = require('./AddUser');
const getSalt = require('./GetSalt');
const login = require('./Login');


const io = require("socket.io")(httpServer,{
      cors: {
        origin: Constants.CORS_ORIGIN,
        methods: Constants.CORS_METHODS
      }});

app.use(express.static('public'));

let streams = []

io.on('connection', (socket) => {

    /*
    Attempt to add new user, data comes in the form of:
        userObj:{
            username: String
            email: String
            password: String
            salt: String
        }
    */
    socket.on(Constants.REGISTER_ATTEMPT, (userObj) => {
        console.log(userObj)
        addUser(userObj)
            .then((result) => {
                if(result != null && result.acknowledged) {
                    const clientUserObj = {
                        result: result,
                        user: {
                            username: userObj.username,
                            email:  userObj.email,
                            subscriptions:[],
                            profilePic:''
                        }
                        
                    }
                    socket.emit(Constants.REGISTER_COMPLETE, clientUserObj)
                    console.log('successful registration')
                }
                else{
                    const failure = {
                        result: Constants.DEFAULT_REGISTER_FAILURE,
                        
                    }
                    socket.emit(Constants.REGISTER_COMPLETE, failure)
                    console.log('failed registration')
                }
            })
    })

    /*
    Ask database for salt of respective user, emit result back to sender:
        userObj:{
            username: String
            email: String
        }
    */
    socket.on(Constants.GET_SALT, (userObj) => {
        getSalt(userObj)
            .then((result) => {
                socket.emit(Constants.SALT_COMPLETE, result)
            })
    })

    socket.on(Constants.LOGIN_ATTEMPT, (userObj) => {
        login(userObj)
            .then((result) => {
                socket.emit(Constants.LOGIN_COMPLETE, result)
            })
    })

    /*
    streamObj: {
        socketID: socket id of streamer,
        username: username of streamer
    }
    */
    socket.on(Constants.START_STREAM, (streamObj) => {
        streams.push(streamObj)
        console.log('Current streams: ', streams)
    })

    socket.on(Constants.END_STREAM, (streamObj) => {
        removeStream(streamObj)
        console.log('Current streams: ', streams)
    })

    /*
    dataObj:{
        streamerUsername: username of streamer,
        socketID: username of viewer,
        username: username of viewer
    }
    */
    socket.on(Constants.JOIN_STREAM_REQUEST, (dataObj) => {
        console.log('Join Stream Reauest: ', dataObj)
        if(userIsStreaming(dataObj.streamerUsername))
            socket.join(dataObj.streamerUsername)
    })


    /*
    messageObj:{
        message: text,
        username: username of sender,
        streamerUsername: username of streamer, used as roomname
    }
    */
    socket.on(Constants.MESSAGE, (messageObj) => {
        console.log('Message: ', messageObj)
        // Send message to room belonging to streamer
        socket.to(messageObj.streamerUsername).emit(Constants.MESSAGE, ({
            username: messageObj.username,
            message: messageObj.message
        }))
    })

    /* 
    dataObj:{
        candidateObj:{
            type: "candidate"
            label: sdpMLineIndex,
            id: sdpMid,
            candidate: candidate,
        },
        toSocketID: socket ID of user that joined the stream
    }
    */
    socket.on(Constants.CANDIDATE, (dataObj) => {
        socket.to(dataObj.toSocketID).emit(Constants.CANDIDATE, dataObj.candidateObj)
    })

    /*
    dataObj:{
        type: offer,
        sessionDescription: session description of the streamers peer,
        toSocketID: socket ID of user that joined the stream,
        ownSocketID: socket ID of self
    }
    */
    socket.on(Constants.OFFER, (dataObj) => {
        socket.to(dataObj.toSocketID).emit(Constants.OFFER, {sessionDescription: dataObj.sessionDescription,
        toSocketID: dataObj.ownSocketID})
    })

    /*
    dataObj:{
        type: answer,
        sessionDescription: session description of the streamers peer,
        toSocketID: socket ID of user that joined the stream,
        ownSocketID: socket ID of self
    }
    */
    socket.on(Constants.ANSWER, (dataObj) => {
        socket.to(dataObj.toSocketID).emit(Constants.ANSWER, dataObj.sessionDescription)
    })

})

const removeStream = (streamObj) => {
    if(streamObj) {
        for(let i=0;i < streams.length; i++){
            if(streams[i].socketID == streamObj.socketID) streams.pop(i);
        }
    }
}

const userIsStreaming = (username,) => {
    for(let streamObj of streams) {
        if(streamObj.username == username) return true
    }
    return false
}

httpServer.listen(Constants.PORT, () => {
    console.log('server is listening on port ' + Constants.PORT);
});