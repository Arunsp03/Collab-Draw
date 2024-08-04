import React, { ChangeEvent, useState } from 'react'
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
    <div>
      <form>
        <label htmlFor="roomname">Roomname</label>
        <input type='text' id='roomname' name='roomname' onChange={(e:ChangeEvent<HTMLInputElement>)=>{
            handlechange(e);
        }}/>
        <button type='button' onClick={()=>{
            setSessionItem(roomname);
            navigator("/whiteboard");
        }}>Lets Collab</button>
      </form>
    </div>
  )
}
