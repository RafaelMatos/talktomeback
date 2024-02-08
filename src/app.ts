import express, { Application } from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'

class App{
  private app: Application;
  private http: http.Server;
  private io: Server;
  constructor() {
    this.app = express()
    this.http = new http.Server(this.app)
    this.io = new Server(this.http,{
      cors:{
        origin:'*'
      }
    })
  }

  public listen(){
    const port = process.env.PORT ? Number(process.env.PORT) : 3333
    
    this.http.listen(port,()=>{
      console.log(`Server running on port ${port}`)
    })
  }

  public listenSocket(){
    this.io.of('/streams').on('connect',this.socketEvents)
  }
  private socketEvents(socket:Socket){
    console.log('Socket connected:' + socket.id)

    socket.on('subscribe',(data)=>{
      console.log('usuario inserido na sala: '+ data.roomId)
      socket.join(data.roomId)
      socket.join(data.socketId)

      const roomSession = Array.from(socket.rooms)

      if(roomSession.length >1){
        socket.to(data.roomId).emit('new user',{
          socketId: socket.id,
          username: data.username
        })
      }

      

      
    })


    socket.on('newUserStart',data=>{
      console.log('Novo usuário chegou')
      socket.to(data.to).emit('newUserStart',{
        sender: data.sender
      })
    })
    
    socket.on('sdp',data => {
      socket.to(data.to).emit('sdp',{
        description:data.description,
        sender:data.sender
      })
    })

    socket.on('ice candidates',data => {
      socket.to(data.to).emit('ice candidates',{
        candidate:data.candidate,
        sender:data.sender
      })
    })

    socket.on('chat',(data)=>{
      console.log("Socket on data:",data)
      socket.broadcast.to(data.roomId).emit('chat',{
        message: data.message,
        username: data.username,
        time: data.time,
      })
    })

    socket.on('disconnect',(data)=>{
      console.log('Socket desconectado:',socket.id)
      socket.disconnect()
    })
  }
}

export { App }