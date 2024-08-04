import React, { useEffect, useRef, useState } from "react";
import "../Styles/Whiteboard.css";
import { FaRegCircle } from "react-icons/fa";
import { MdOutlineRectangle } from "react-icons/md";
import { MdBrush } from "react-icons/md";
import { useSessionHook } from "../Hooks/useSessionHook";
import { ImUndo } from "react-icons/im";

export default function Whiteboard() {
  const{getSessionItem}=useSessionHook("roomname");
  const socket = useRef<WebSocket | null>(null);
  const chooseCircleElement = useRef<HTMLButtonElement | null>(null);
  const chooseRectangleElement = useRef<HTMLButtonElement | null>(null);
  const Whiteboardref = useRef<HTMLCanvasElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const draw = useRef(false); // for freehand
  const drawRectangle = useRef(false); // for rectangles
  const drawCircle = useRef(false); // for circles
  const Eraser=useRef(false);
  const strokeColor = useRef<HTMLInputElement | null>(null);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const rectangleBounds = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const circleBounds = useRef<{
    x: number;
    y: number;
    radius: number;
  } | null>(null);
  const savedCanvasState = useRef<ImageData | null>(null);
  const handleStrokeColorChange = (e: any) => {
    if (context.current) {
      context.current.strokeStyle = e.target.value;
    }
  };
  const intializeSocketConnection = () => {
    socket.current = new WebSocket("ws://localhost:8080/");
    socket.current.onopen = (e) => {
      
      if(socket.current?.readyState==WebSocket.OPEN){
      
        
        socket.current?.send(JSON.stringify({type:"Join",room:getSessionItem()}))
        }
    };
    socket.current.onmessage=(e)=>{
      const data = JSON.parse(e.data);
      if (data.type === "canvasImage") {
  
        if(data.image){
        const image = new Image();
        image.src = data.image;
        image.onload = () => {
          context.current!.clearRect(0, 0, Whiteboardref.current!.width, Whiteboardref.current!.height);
          context.current!.drawImage(image, 0, 0);
        };
      }
      else{
        context.current!.clearRect(0, 0, Whiteboardref.current!.width, Whiteboardref.current!.height);
      }
       
      }
   
    }

  };

  const chooseDrawElement = useRef<HTMLButtonElement | null>(null);

  const handleMouseUp = (e: MouseEvent) => {
    if (
      drawRectangle.current &&
      lastPosition.current &&
      rectangleBounds.current &&
      savedCanvasState.current
    ) {
      
      context.current?.putImageData(savedCanvasState.current, 0, 0);

     
      context.current?.beginPath();
      context.current?.rect(
        rectangleBounds.current?.x,
        rectangleBounds.current?.y,
        rectangleBounds.current?.width,
        rectangleBounds.current?.height
      );
      context.current?.stroke();
    
    } else if (
      drawCircle.current &&
      circleBounds.current &&
      savedCanvasState.current
    ) {
      
      context.current?.putImageData(savedCanvasState.current, 0, 0);
      context.current?.beginPath();
      context.current?.arc(
        circleBounds.current.x,
        circleBounds.current.y,
        circleBounds.current.radius,
        0,
        2 * Math.PI
      );
      context.current?.stroke();
    }

    lastPosition.current = null;
    rectangleBounds.current = null;
    circleBounds.current = null;
    savedCanvasState.current = null;
    const image = Whiteboardref.current?.toDataURL("image/png");
   socket.current!.send(JSON.stringify({ type: "canvasImage", image,room:getSessionItem() }));
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (
      drawRectangle.current &&
      lastPosition.current &&
      Whiteboardref.current &&
      rectangleBounds.current &&
      savedCanvasState.current
    ) {
      let width = e.offsetX - lastPosition.current.x;
      let height = e.offsetY - lastPosition.current.y;

      rectangleBounds.current = {
        x: lastPosition.current.x,
        y: lastPosition.current.y,
        width,
        height,
      };

      // Restore the canvas to the saved state
      context.current?.putImageData(savedCanvasState.current, 0, 0);

      // Draw the new rectangle
      context.current?.beginPath();
      context.current?.rect(
        rectangleBounds.current?.x,
        rectangleBounds.current?.y,
        rectangleBounds.current?.width,
        rectangleBounds.current?.height
      );
      context.current?.stroke();
    } else if (drawCircle.current && savedCanvasState.current) {
      const dx = e.offsetX - lastPosition.current!.x;
      const dy = e.offsetY - lastPosition.current!.y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      circleBounds.current = {
        x: lastPosition.current!.x,
        y: lastPosition.current!.y,
        radius,
      };

      context.current?.putImageData(savedCanvasState.current, 0, 0);
      context.current?.beginPath();
      context.current?.arc(
        circleBounds.current!.x,
        circleBounds.current!.y,
        circleBounds.current!.radius,
        0,
        2 * Math.PI
      );
      context.current?.stroke();
    } else if (draw.current && lastPosition.current && Whiteboardref.current) {
      const currentPos = { x: e.offsetX, y: e.offsetY };

      context.current?.moveTo(lastPosition.current.x, lastPosition.current.y);
      context.current?.lineTo(currentPos.x, currentPos.y);
      context.current?.stroke();
      lastPosition.current = currentPos;
    
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (context.current) {
      lastPosition.current = { x: e.offsetX, y: e.offsetY };
      savedCanvasState.current = context.current.getImageData(
        0,
        0,
        Whiteboardref.current!.width,
        Whiteboardref.current!.height
      ); 
      context.current?.beginPath();
    }
    if (drawRectangle.current && lastPosition.current) {
      rectangleBounds.current = {
        x: e.offsetX,
        y: e.offsetY,
        width: 0,
        height: 0,
      };
    } else if (drawCircle.current) {
      circleBounds.current = { x: e.offsetX, y: e.offsetY, radius: 0 };
    }
  };

  const initialize = () => {
    if (Whiteboardref.current?.getContext) {
      context.current = Whiteboardref.current.getContext("2d");
      Whiteboardref.current.height = 700;
      Whiteboardref.current.width = 1200;
    }

    if (context.current) {
      context.current.strokeStyle = "#000000";
      context.current.lineWidth = 2;

      
 
   

  

      Whiteboardref.current?.addEventListener("mousedown", handleMouseDown);
      Whiteboardref.current?.addEventListener("mousemove", handleMouseMove);
      Whiteboardref.current?.addEventListener("mouseup", handleMouseUp);
      strokeColor.current?.addEventListener("change", handleStrokeColorChange);
    }
 
  };

  useEffect(() => {
    intializeSocketConnection();
    initialize();
    
    return ()=>{
      Whiteboardref.current?.removeEventListener("mousedown", handleMouseDown);
      Whiteboardref.current?.removeEventListener("mousemove", handleMouseMove);
      Whiteboardref.current?.removeEventListener("mouseup", handleMouseUp);
      strokeColor.current?.removeEventListener("change", handleStrokeColorChange);
    }

  }, []);

  return (
    <div className="board">
      <div id="sidebar">
        <button type="button" onClick={()=>{ 
          socket.current?.send(JSON.stringify({type:"Undo",room:getSessionItem()}))
        }}>
         <ImUndo size={30} title="Undo"/>
        </button>
        <button
          ref={chooseDrawElement}
          type="button"
          onClick={(e) => {
            draw.current = !draw.current;
            chooseDrawElement.current?.classList.toggle("highlight");
            drawRectangle.current = false;
            drawCircle.current = false;
            Eraser.current=false;
            chooseRectangleElement.current?.classList.remove("highlight");
            chooseCircleElement.current?.classList.remove("highlight");
          }}
        >
          <MdBrush size={30} title="Brush"/>
        </button>
        <button
          ref={chooseCircleElement}
          type="button"
          onClick={() => {
            drawCircle.current = !drawCircle.current;
            chooseCircleElement.current?.classList.toggle("highlight");
            draw.current = false;
            drawRectangle.current = false;
            chooseDrawElement.current?.classList.remove("highlight");
            chooseRectangleElement.current?.classList.remove("highlight");
            Eraser.current=false;
          }}
        >
          <FaRegCircle size={30} title="Circle"/>
        </button>
        <button
          ref={chooseRectangleElement}
          type="button"
          onClick={() => {
            drawRectangle.current = !drawRectangle.current;
            chooseRectangleElement.current?.classList.toggle("highlight");
            draw.current = false;
            drawCircle.current = false;
            chooseDrawElement.current?.classList.remove("highlight");
            chooseCircleElement.current?.classList.remove("highlight");
            Eraser.current=false;
          }}
        >
          <MdOutlineRectangle size={30} title="Rectangle"/>
        </button>
        <button type="button" onClick={()=>{
          Eraser.current=true;
          draw.current = false;
          drawCircle.current = false;
          drawRectangle.current=false

        }}>
          Eraser
        </button>

        <input
          ref={strokeColor}
          type="color"
          id="strokeColor"
          name="strokeColor"
        />
      </div>
      <canvas ref={Whiteboardref} id="Whiteboard"></canvas>
    </div>
  );
}
