

import {createServer, Server} from "http"
import { createRequire } from "module";
import { disconnect } from "process";
import {  Subject } from "rxjs";
import  {filter} from "rxjs/operators";
import {ProxyClient} from "./models/ProxyClient.js";
import {sendSMS} from "./models/sendSMS.js"
const require = createRequire(import.meta.url);

let proxyList: ProxyClient[] = [];
class MySocketIO{
   // IOServer:Server | null = null;
    socketIO:any;
    sendMessageSubject: Subject<sendSMS> = new Subject()
    
    //port = process.env.SOCKETIO_PORT || 4500;

    constructor(private IOServer:Server){
        this.init(); 
    };

    init(){
      //  this.IOServer = createServer();
        this.socketIO = require('socket.io')(this.IOServer,{
         origin: "*",
         methods: ["GET", "POST"],
       })
       this.listen();
       console.log("SocketIO is running!")
      
    }


    listen() {
        const mySocket = this.socketIO;
        console.log("Listen")
        mySocket.on('connection', function (client:any) {
            console.log('Connected...', client.id);
       
            client.on('message', function name(data:any) {
              console.log(data);
              mySocket.emit('message', data);
            });

            client.on('registerProxy', function name(proxy:ProxyClient) {
              // sendMessageSubject.pipe(
              //   filter((msg: sendSMS)=> proxy.number == msg.proxyNumber)
              // ).subscribe((msg:sendSMS)=>{
              //   client.emit
              // })
              proxyList.push(proxy);

              client.on(proxy.number, (data:sendSMS)=>{
                client.emit('sendMessage', data);
              })
              mySocket.emit('connectedProxy', proxy);

              client.on('disconnect', function () {
               proxyList = proxyList.filter(p=>p.number != proxy.number);
               mySocket.emit('updateProxyClients', proxyList);
              })
              mySocket.emit('updateProxyClients', proxyList);
            });
        
          //listens when a user is disconnected from the server
            client.on('disconnect', function () {
              console.log('Disconnected...', client.id);
            })
          
          //listens when there's an error detected and logs the error on the console
            client.on('error', function (err:any) {
              console.log('Error detected', client.id);
              console.log(err);
            })

            client.emit('updateProxyClients', proxyList);

          })
    }
 

};

export class BTSocketIO {
    static instance:MySocketIO | null = null;
    static httpServer:Server | null = null;
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static getInstance() {
        if (!BTSocketIO.instance)
          console.error("Soket nije inicijalizovan, pozovite funkciju init().");
        
        return BTSocketIO.instance;
    }
    static init(IOServer:Server){
        if (!BTSocketIO.instance) {
            BTSocketIO.instance = new MySocketIO(IOServer);
        }
    }
}


export function getSocket() 
{
 return  BTSocketIO.getInstance()?.socketIO;
} 






