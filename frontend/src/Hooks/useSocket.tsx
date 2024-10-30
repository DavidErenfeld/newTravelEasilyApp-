import { useEffect, useCallback } from "react";
import io from "socket.io-client";

// חיבור Socket.IO
const socket = io("https://evening-bayou-77034-176dc93fb1e1.herokuapp.com/");

const useSocket = (event?: string, onEvent?: (data: any) => void) => {
  // האזנה לאירועים
  useEffect(() => {
    if (event && onEvent) {
      socket.on(event, onEvent);

      return () => {
        socket.off(event);
      };
    }
  }, [event, onEvent]);

  // פונקציה לשליחת אירועים
  const send = useCallback((event: string, data: any) => {
    socket.emit(event, data);
  }, []);

  return { send };
};

export default useSocket;
