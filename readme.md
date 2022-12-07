# DirectX Server
### Handle user authentication, WebRTC connections, active streams, subscriptions and messaging.
### [DirectX.Live](https://directx.live)

* **
## Authentication
### Registration 
* Attempt to add user to database
* Send back client information on a successful registration
* Send failure if user exists
### Login
* Listen for a request of the salt of the user attempting to log in and send it to that user. A salt is a randomly generated hash that is appended to a users password. This makes sure that 2 users with the same password will have different hashes in the database, making it impossible to tell if 2 users have the same password. 
* After the server sends the salt to the client, the client will send a login request. The server will check the database if the credentials match, and send the result back to the client.

* **

## WebRTC 
WebRTC connection events happen sequintially. The connection begins with a request from the viewer, then an offer from the streamer, and finally an answer from the viewer.
1. The viewer sends a WebRTC connection request to the server, specifying the username of the streamer they want to watch, and their own socketID. The server then sends this information to the streamer.
2. The streamer sends an offer of their session description and sokcetID to the server, and the server forwards this to the viewer.
3. The viewer responds with and answer of their own session description, and the server forwards it to the streamer.
* **
## Active streams
The server keeps track of all active streams in an array. The array stores objects consisting of each streamers username, socketID, and tags of their stream. When a stream ends the corresponding object is removed from the array, and a message is broadcast to clients alerting them of which stream just ended.
* Listen to new streams, and broadcast them to all clients when a new one starts.
* Listen to stream ended events, and when one is received, broadcast to all clients which stream just ended.
* Listen to viewers attempting to join streams. When an attempt is made, check if the stream is still active and emit the result. If it is successful, join that streams chat room.
* Each stream has a chatroom, the roomname is the streamers username, and all incoming messages are emitted to everyone watching that stream.
* **
## Subscriptions
Users can subscribe to streamers. When they do so, the streamers username is added into the set of subscriptions in the database. On the client side, users will see whenever one of the streamers they subscribed to is currently live.
