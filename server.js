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

    socket.on(Constants.START_STREAM, (streamObj) => {
        streams.push(streamObj)
        console.log('Current streams: ', streams)
    })

    socket.on(Constants.END_STREAM, (streamObj) => {
        removeStream(streamObj)
        console.log('Current streams: ', streams)
    })

})

const removeStream = (streamObj) => {
    if(streamObj) {
        for(let i=0;i < streams.length; i++){
            if(streams[i].socketID == streamObj.socketID) streams.pop(i);
        }
    }
}

httpServer.listen(Constants.PORT, () => {
    console.log('server is listening on port ' + Constants.PORT);
});