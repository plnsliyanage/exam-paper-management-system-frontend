const NotificationCard = ({ notification }) => {
  return (
    <div
      className="
        bg-white
        shadow
        rounded-lg
        p-5
        mb-4
        border-l-4
        border-blue-600
        "
    >
      <h2
        className="
            text-lg
            font-bold
            "
      >
        {notification.title}
      </h2>

      <p
        className="
            text-gray-700
            mt-2
            "
      >
        {notification.message}
      </p>

      <div
        className="
            mt-3
            text-sm
            text-gray-500
            "
      >
        {notification.createdAt}
      </div>
    </div>
  );
};

export default NotificationCard;
