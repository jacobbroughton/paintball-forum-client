import { useEffect, useRef } from "react";
import "./NotificationsMenu.css";
import { toggleModal } from "../../../redux/modals";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import { supabase } from "../../../utils/supabase";

const NotificationsMenu = ({ notifications, setNotifications }) => {
  const dispatch = useDispatch();
  const notificationsMenuRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(e.target) &&
        !e.target.classList.contains("notifications-menu-toggle")
      ) {
        dispatch(toggleModal({ key: "notificationsMenu", value: false }));
      }
    }

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  });

  async function handleNotificationRead(notification) {
    try {
      if (notification.status == "Read") return;
      const { data, error } = await supabase.rpc("read_notification", {
        p_notification_id: notification.id,
      });

      if (error) throw error.message;

      if (!data) throw "Something happened when trying to read the notification";

      console.log(data[0]);

      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          ...(notif.id == notification.id && {
            ...data[0],
          }),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="notifications-menu" ref={notificationsMenuRef}>
      <div className="header">
        <p>Notifications</p>
      </div>
      <ul>
        {notifications?.length != 0 ? (
          notifications?.map((notification) => (
            <li>
              <Link
                to={`/${notification.item_id}`}
                onClick={() => {
                  dispatch(toggleModal({ key: "notificationsMenu", value: false }));
                  handleNotificationRead(notification);
                }}
              >
                <div className="notification-body">
                  {notification.type == "Comment" ? (
                    <p>{notification.username} commented on your post</p>
                  ) : notification.type == "Reply" ? (
                    <p>{notification.username} replied to your comment</p>
                  ) : (
                    false
                  )}
                  <p className="time-ago">
                    {getTimeAgo(new Date(notification.created_at))}
                  </p>
                </div>
                <div
                  className={`read-circle ${
                    notification.status == "Read" ? "read" : "unread"
                  }`}
                  title={`This notification${notification.status == "Read" ? `was read at ${notification.read_at}` : ' has not been read yet'}`}
                ></div>
              </Link>
            </li>
          ))
        ) : (
          <div className="no-notifications">
            You don't have any notifications right now...
          </div>
        )}
      </ul>
    </div>
  );
};
export default NotificationsMenu;
