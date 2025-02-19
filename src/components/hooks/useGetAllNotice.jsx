import { useState, useEffect } from "react";
import { getAllNoti } from "../../services/apiRequest";

export default function useGetAllNotice() {
  const [notice, setNotice] = useState([]);

  useEffect(() => {
    const getNotifications = async () => {
      const response = await getAllNoti();
      setNotice(response);
    };
    getNotifications();
  }, []);

  return { notice, setNotice };
}
