export const useSessionHook=(itemName:string)=>{
    const getSessionItem=()=>{
     return sessionStorage.getItem(itemName);
    }
    const setSessionItem=(value:string)=>{
        sessionStorage.setItem(itemName,value);
    }
    const deleteSessionItem=()=>{
        sessionStorage.removeItem(itemName);
    }
    return {getSessionItem,setSessionItem,deleteSessionItem};

}