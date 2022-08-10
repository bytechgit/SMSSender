import { createRequire } from "module";
import { Subject } from "rxjs";
const require = createRequire(import.meta.url);
let proxyList = [];
class MySocketIO {
    //port = process.env.SOCKETIO_PORT || 4500;
    constructor(IOServer) {
        this.IOServer = IOServer;
        this.sendMessageSubject = new Subject();
        this.init();
    }
    ;
    init() {
        //  this.IOServer = createServer();
        this.socketIO = require('socket.io')(this.IOServer, {
            origin: "*",
            methods: ["GET", "POST"],
        });
        this.listen();
        console.log("SocketIO is running!");
    }
    listen() {
        const mySocket = this.socketIO;
        console.log("Listen");
        mySocket.on('connection', function (client) {
            console.log('Connected...', client.id);
            client.on('message', function name(data) {
                console.log(data);
                mySocket.emit('message', data);
            });
            client.on('registerProxy', function name(proxy) {
                // sendMessageSubject.pipe(
                //   filter((msg: sendSMS)=> proxy.number == msg.proxyNumber)
                // ).subscribe((msg:sendSMS)=>{
                //   client.emit
                // })
                proxyList.push(proxy);
                client.on(proxy.number, (data) => {
                    client.emit('sendMessage', data);
                });
                mySocket.emit('connectedProxy', proxy);
                client.on('disconnect', function () {
                    proxyList = proxyList.filter(p => p.number != proxy.number);
                    mySocket.emit('updateProxyClients', proxyList);
                });
                mySocket.emit('updateProxyClients', proxyList);
            });
            //listens when a user is disconnected from the server
            client.on('disconnect', function () {
                console.log('Disconnected...', client.id);
            });
            //listens when there's an error detected and logs the error on the console
            client.on('error', function (err) {
                console.log('Error detected', client.id);
                console.log(err);
            });
            client.emit('updateProxyClients', proxyList);
        });
    }
}
;
export class BTSocketIO {
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static getInstance() {
        if (!BTSocketIO.instance)
            console.error("Soket nije inicijalizovan, pozovite funkciju init().");
        return BTSocketIO.instance;
    }
    static init(IOServer) {
        if (!BTSocketIO.instance) {
            BTSocketIO.instance = new MySocketIO(IOServer);
        }
    }
}
BTSocketIO.instance = null;
BTSocketIO.httpServer = null;
export function getSocket() {
    return BTSocketIO.getInstance()?.socketIO;
}
