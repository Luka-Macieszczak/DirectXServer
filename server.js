const express = require("express");
const app = express();
const path = require('path');
var https = require('https');
var http = require('http');

const Constants = require("./Constants");
const httpsServer = http.createServer(app);

//const httpServer = require("http").createServer();
const getUser = require('./GetUser');
const addUser = require('./AddUser');
const getSalt = require('./GetSalt');
const login = require('./Login');
const addSubscription = require('./AddSubscription');
const catchEm = require('./catchEm')
const cors = require("cors")
const removeUser = require('./RemoveUser');
const getAllUsers = require('./GetAllUsers');

let streams = {}

const io = require("socket.io")(httpsServer,{
    cors: {
    origin: Constants.CORS_ORIGIN,
    methods: Constants.CORS_METHODS
}});

app.use(express.static(path.join(__dirname, 'build')));
app.use(cors());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('socket ID: ', socket.id)

    socket.on("disconnect", (reason) => {
        console.log('Socket disconnect: ', reason)
        const removed = removeStreamByID(socket.id)
        if(removed) {
            io.emit(Constants.STREAM_ENDED, ({username: removed.username}))
        }
    });

    socket.emit(Constants.SUCCESSFUL_CONNECTION, socket.id);
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
                            profilePic:'https://fomantic-ui.com/images/wireframe/white-image.png',
                            authorization: 'default'
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
        username: username of streamer,
        tags: tags of stream (i.e. gaming, educational... etc),
        description: description of stream
    }
    */
    socket.on(Constants.START_STREAM, async (streamObj) => {
        streams[streamObj.username] = {
            socketID: streamObj.socketID,
            tags: streamObj.tags,
            username: streamObj.username,
            description: streamObj.description
        }
        socket.join(streamObj.username)

        io.emit(Constants.NEW_STREAM, ({stream: await getUser(streamObj.username), tags:streamObj.tags,
            description: streamObj.description}))
        console.log('Current streams: ', streams)
    })

    /*
    streamObj: {
        socketID: sessionID,
        username: user.username,
        tags: tags
    }
    */
    socket.on(Constants.END_STREAM, (streamObj) => {
        removeStream(streamObj)
        console.log('END STREAM: Current streams: ', streams)
        io.emit(Constants.STREAM_ENDED, ({username: streamObj.username}))
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
        if(userIsStreaming(dataObj.streamerUsername)){
            socket.join(dataObj.streamerUsername)
            socket.emit(Constants.JOIN_STREAM_RESULT, {didSucceed: true})
        } else 
            socket.emit(Constants.JOIN_STREAM_RESULT, {didSucceed: false})
    })


    /*
    messageObj:{
        message: text,
        username: username of sender,
        streamerUsername: username of streamer, used as roomname,
        profilePic: profile pic of sender
    }
    */
    socket.on(Constants.MESSAGE, (messageObj) => {
        console.log('Message: ', messageObj)
        // Send message to room belonging to streamer
        socket.to(messageObj.streamerUsername).emit(Constants.MESSAGE, ({
            username: messageObj.username,
            message: messageObj.message,
            profilePic: messageObj.profilePic
        }))
    })

    /* 
    dataObj:{
        streamerUsername: username of streamer,
        socketID: socket id of sender
    }
    */
    socket.on(Constants.WEBRTC_CONNECTION_REQUEST, (dataObj) => {
        const stream = userIsStreaming(dataObj.streamerUsername);
        console.log('Attempted webRTC connection: ', dataObj)
        console.log('Streams: ', streams)

        if(stream){
            console.log('dummytest')
            const senderObj = {
                socketID :dataObj.socketID
            }
            io.to(stream.socketID).emit(Constants.WEBRTC_CONNECTION_REQUEST, senderObj);
        }
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
        console.log('Candidate: ', dataObj);
        io.to(dataObj.toSocketID).emit(Constants.CANDIDATE, dataObj.candidateObj)
    })

    /*
    dataObj:{
        type: offer,
        sdp: session description of the streamers peer,
        toSocketID: socket ID of user that joined the stream,
        ownSocketID: socket ID of streamer
    }
    */
    socket.on(Constants.OFFER, (dataObj) => {
        console.log('Offer', dataObj.toSocketID);
        io.to(dataObj.toSocketID).emit(Constants.OFFER, {sdp: dataObj.sdp,
        toSocketID: dataObj.ownSocketID})
    })

    /*
    dataObj:{
        type: answer,
        sdp: session description of the streamers peer,
        toSocketID: socket ID of streamer
        ownSocketID: socket ID of viewer
    }
    */
    socket.on(Constants.ANSWER, (dataObj) => {
        console.log('Answer:', dataObj);
        io.to(dataObj.toSocketID).emit(Constants.ANSWER, {sdp: dataObj.sdp, toSocketID: dataObj.toSocketID})
    })

    /*
    dataObj:{
        tag: tag of streams,
    }
    */
    socket.on(Constants.REQUEST_STREAMS, async (dataObj) => {
        const returnObj = {
            streams: []
        }
        console.log(dataObj)
        for(const stream of Object.keys(streams)){
            // console.log('Current tags: ', streams[stream].tags)
            if(dataObj.tag in streams[stream].tags)
                returnObj.streams.push({...await getUser(stream), tag:dataObj.tag,
                    description: streams[stream].description})
        }
        console.log('STreams requested: ', returnObj)
        socket.emit(Constants.REQUEST_STREAMS_ACK, (returnObj))
    })

    /*
    dataObj:{
        username: username of subscriber,
        streamerUsername: username of streamer being subscribed to
    }
    */
    socket.on(Constants.NEW_SUBSCRIPTION, (dataObj) => {
        addSubscription(dataObj)
    })

    socket.on(Constants.GET_ALL_USERS, async () => {
        console.log("ALL Users: ", await getAllUsers())
        socket.emit(Constants.GET_ALL_USERS_ACK, await getAllUsers())
    })

    /*
    user = {
            username: ***,
            email: ***,
            profilePic: ***,
            authorization: ***,
            subscriptions: [***...]
        }
     */
    socket.on(Constants.REMOVE_USER, async (user) => {
        removeUser(user)
        socket.emit(Constants.GET_ALL_USERS_ACK, await getAllUsers())
    })

})


// Remove a stream by username
// Would occur if a streamer ends their stream but stays connected
const removeStream = (streamObj) => {
    if(streamObj.username in streams) {
        delete streams[streamObj.username]
    }
}

// Check if a user is streaming by username
const userIsStreaming = (username) => {
    if(username in streams) {
        return streams[username]
    }
    return null
}

// Delete stream by socketID on disconnect
const removeStreamByID = (ID) => {
    let ret = null
    for(const stream of Object.keys(streams)){
        if(streams[stream].socketID === ID){
            console.log('ending stream: ', streams[stream])
            ret = streams[stream]
            delete streams[stream]
            console.log('Streams: ', streams)
        }
    }
    return ret;
}


httpsServer.listen(Constants.PORT, () => {
    console.log('Server listening on port: ', Constants.PORT)
}) 
/*httpServer.listen(Constants.PORT, () => {
    console.log('server is listening on port ' + Constants.PORT);
});*/

// app.listen(4001)