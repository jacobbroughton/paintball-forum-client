import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { resetFilters } from "../../../redux/filters";
import RightSideMenu from "../RightSideMenu/RightSideMenu";
import HomeIcon from "../Icons/HomeIcon";
import FilterIcon from "../Icons/FilterIcon";
import SearchBar from "../SearchBar/SearchBar";
import { setDraftSearchValue } from "../../../redux/search";
import { setFlag } from "../../../redux/flags";
import useWindowSize from "../../../utils/useWindowSize";
import { useCurrentPath } from "../../../utils/usefulFunctions";
import NotificationsMenu from "../NotificationsMenu/NotificationsMenu";
import BellIcon from "../Icons/BellIcon";
import { supabase } from "../../../utils/supabase";
import { useEffect, useState } from "react";

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { session, user } = useSelector((state) => state.auth);
  const modals = useSelector((state) => state.modals);
  const [notifications, setNotifications] = useState(null);

  const windowSize = useWindowSize();

  function handleRightSideMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleModal({ key: "notificationsMenu", value: false }));
    dispatch(toggleModal({ key: "rightSideMenu", value: !modals.rightSideMenuToggled }));
  }

  function handleNotificationsMenuToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleModal({ key: "rightSideMenu", value: false }));

    dispatch(
      toggleModal({ key: "notificationsMenu", value: !modals.notificationsMenuToggled })
    );
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    dispatch(setDraftSearchValue(draftSearchValue));

    getListings(draftSearchValue);
  }

  async function handleNotificationsSubscribe() {
    try {
      if (!user) return;

      const { data, error } = await supabase.rpc("get_comment_notifications", {
        p_user_id: user.auth_id,
      });

      if (error) throw error.message;

      let localNotifications = data;

      setNotifications(localNotifications);

      supabase
        .channel("comment_notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "comment_notifications" },
          (payload) => {
            localNotifications.unshift(payload.new);
            setNotifications(localNotifications);
            console.log("Change received!", payload);
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("Connected!");
          }

          if (status === "CHANNEL_ERROR") {
            console.log(`There was an error subscribing to channel: ${err.message}`);
          }

          if (status === "TIMED_OUT") {
            console.log("Realtime server did not respond in time.");
          }

          if (status === "CLOSED") {
            console.log("Realtime channel was unexpectedly closed.");
          }
        });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (user) handleNotificationsSubscribe();
  }, [user]);

  return (
    <nav>
      <div className="home-link-and-filter-button">
        {/* {location.pathname == '/' && <button
          onClick={() =>
            dispatch(
              toggleModal({
                key: "filtersSidebar",
                value: windowSize.width > 625 ? !modals.filtersSidebarToggled : true,
              })
            )
          }
        >
          <FilterIcon />
        </button>} */}
        <Link
          to="/"
          className="home-link"
          onClick={() => {
            dispatch(resetFilters());
            dispatch(setFlag({ key: "searchedListingsNeedUpdate", value: true }));
          }}
        >
          {/* <p>Core PB</p> */}
          <HomeIcon />
        </Link>
      </div>

      <div className="right-side">
        <SearchBar handleSearchSubmit={handleSearchSubmit} />

        <Link to="/sell" className="sell-link" style={{}}>
          {/* <PlusIcon /> */}
          Sell
        </Link>

        {session?.user ? (
          <>
            <button
              type="button"
              className="notifications-menu-toggle"
              onClick={handleNotificationsMenuToggle}
            >
              <BellIcon />
            </button>
            <button
              onClick={handleRightSideMenuToggle}
              className="right-side-menu-button"
            >
              <img className="profile-picture" src={user.profile_picture_url} />
            </button>
          </>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
      </div>
      {modals.rightSideMenuToggled && session && <RightSideMenu />}
      {modals.notificationsMenuToggled && session && (
        <NotificationsMenu
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </nav>
  );
}

export default Navbar;
