import { useState, useEffect } from "react";
import { getNoti } from "../services/apiRequest";
//getNotice

export default function useGetNoticeByUser() {
  const [noticeByUser, setNoticeByUser] = useState([]);

  useEffect(() => {
    const getNotificationsByUser = async () => {
      const response = await getNoti();
      setNoticeByUser(response);
    };
    getNotificationsByUser();
  }, []);

  return { noticeByUser, setNoticeByUser };
}
