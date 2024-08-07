import { WebSocketServer,WebSocket } from 'ws';
const wss = new WebSocketServer({ port: 8080 });
type CollabRooms={
  [roomname:string]: WebSocket[];
}
type CanvasHitory={
  [roomname:string]:string[]
}
let collabRoomManager:CollabRooms={};
let historyManager:CanvasHitory={};
wss.on('connection', function connection(ws) { 
  ws.on('error', console.error);
  ws.on('message', function message(data) {
    const receiveddata=JSON.parse(data.toString());
    if(receiveddata.type=="canvasImage")
    {
      collabRoomManager[receiveddata.room].forEach((client)=>{
        if(client!=ws)
        {
        if(historyManager[receiveddata.room])
        {
          historyManager[receiveddata.room].push(receiveddata.image);
        }
        else{
          historyManager[receiveddata.room]=[receiveddata.image];
        }
        client.send(JSON.stringify({type:"canvasImage",image:receiveddata.image}))
        }
      })
    }
    else if(receiveddata.type=="Join")
    {
    //  console.log("roomname",receiveddata.room);
      
      if(collabRoomManager[receiveddata.room])
      {
        if(!collabRoomManager[receiveddata.room].includes(ws))
        {
          collabRoomManager[receiveddata.room].push(ws);
        }
      }
      else{
        collabRoomManager[receiveddata.room]=[ws];
      }
  //    console.log("total no of people in this room",collabRoomManager[receiveddata.room].length)
    }
    else if (receiveddata.type === "Undo") {
      const room = receiveddata.room;
      let imageArr = historyManager[room];
 //     console.log("imagearr length",imageArr.length);
      

      if (imageArr) {
        if (imageArr.length > 1) {
          historyManager[room].pop(); // Remove the current image
          const previousImage = imageArr[imageArr.length - 1]; // Send the previous image
          collabRoomManager[room].forEach(client => {
            client.send(JSON.stringify({ type: "canvasImage", image: previousImage }));
          });
        } else if (imageArr.length === 1) {
          const onlyImage = imageArr[0];
          collabRoomManager[room].forEach(client => {
            client.send(JSON.stringify({ type: "canvasImage", image: onlyImage }));
          });
          historyManager[room] = []; // Clear the history
        }
        else{
          collabRoomManager[room].forEach(client => {
            client.send(JSON.stringify({ type: "canvasImage", image: null }));
            });
        }
      }
      else{

        collabRoomManager[room].forEach(client => {
        client.send(JSON.stringify({ type: "canvasImage", image: null }));
        });
       
      }
    }
  });

 
});