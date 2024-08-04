import React, { ChangeEvent, useState } from 'react'
import "../Styles/RoomDetails.css"
import { useNavigate } from 'react-router-dom';
import { useSessionHook } from '../Hooks/useSessionHook';
export default function RoomDetails() {
    const[roomname,setRoomName]=useState<string>('');
    const {setSessionItem}=useSessionHook("roomname");
    const navigator=useNavigate();
    const handlechange=(e:ChangeEvent<HTMLInputElement>)=>{
        setRoomName(e.target.value);
    }
  return (
    <div id='form-modal'>
      <form id='room-form'>

        <label htmlFor="roomname">Roomname</label>
        <input type='text' id='roomname' name='roomname' placeholder='Enter room code' onChange={(e:ChangeEvent<HTMLInputElement>)=>{
            handlechange(e);
        }}/>
        <button type='button' onClick={()=>{
            setSessionItem(roomname);
            navigator("/whiteboard");
        }}>Collab</button>
      </form>
    </div>
  )
}
