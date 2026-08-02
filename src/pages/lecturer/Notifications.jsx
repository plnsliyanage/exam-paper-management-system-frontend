import { useEffect, useState } from "react";

import { getNotifications } from "../../api/lecturerApi";

import NotificationCard from "../../components/lecturer/NotificationCard";

const Notifications = () => {
  const lecturerId = "L001";

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications(lecturerId);

      setNotifications(data);
    } catch (error) {
      console.error("Notification loading error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2 className="text-xl font-bold">Loading Notifications...</h2>;
  }

  return (
    <div>
      <h1
        className="
            text-3xl
            font-bold
            mb-8
            "
      >
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications available</p>
      ) : (
        notifications.map((notification) => (
          <NotificationCard
            key={notification.notificationId}
            notification={notification}
          />
        ))
      )}
    </div>
  );
};

export default Notifications;
