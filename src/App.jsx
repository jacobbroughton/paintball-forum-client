import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { CreateWantedItem } from "./components/pages/CreateWantedItem/CreateWantedItem.jsx";
import { Listings } from "./components/pages/Home/Home.jsx";
import { Item } from "./components/pages/Item/Item.jsx";
import { Login } from "./components/pages/Login/Login.jsx";
import { Register } from "./components/pages/Register/Register.jsx";
import { ResetPassword } from "./components/pages/ResetPassword/ResetPassword.jsx";
import { Sell } from "./components/pages/Sell/Sell.jsx";
import { UpdatePassword } from "./components/pages/UpdatePassword/UpdatePassword.jsx";
import { UserProfile } from "./components/pages/UserProfile/UserProfile.jsx";
import { WantedItem } from "./components/pages/WantedItem/WantedItem.jsx";
import BugModal from "./components/ui/BugModal/BugModal.jsx";
import { ErrorBanner } from "./components/ui/ErrorBanner/ErrorBanner.tsx";
import FeedbackModal from "./components/ui/FeedbackModal/FeedbackModal.jsx";
import { LoadingOverlay } from "./components/ui/LoadingOverlay/LoadingOverlay.jsx";
import { LoginModal } from "./components/ui/LoginModal/LoginModal.jsx";
import { MobileBottomNav } from "./components/ui/MobileBottomNav/MobileBottomNav.jsx";
import { Navbar } from "./components/ui/Navbar/Navbar.jsx";
import { RegisterModal } from "./components/ui/RegisterModal/RegisterModal.jsx";
import { ResetPasswordModal } from "./components/ui/ResetPasswordModal/ResetPasswordModal.jsx";
import { SearchModal } from "./components/ui/SearchModal/SearchModal.jsx";
import { setSession, setUser } from "./redux/auth.ts";
import { supabase } from "./utils/supabase.ts";
import { isOnMobile } from "./utils/usefulFunctions.js";
import { PrivateRoutes } from "./components/wrappers/PrivateRoutes.tsx";

export function App() {
  const dispatch = useDispatch();

  const session = useSelector((state) => state.auth.session);

  const resetPasswordModalToggled = useSelector(
    (state) => state.modals.resetPasswordModalToggled
  );
  const registerModalToggled = useSelector((state) => state.modals.registerModalToggled);
  const loginModalToggled = useSelector((state) => state.modals.loginModalToggled);
  const feedbackModalToggled = useSelector((state) => state.modals.feedbackModalToggled);
  const bugModalToggled = useSelector((state) => state.modals.bugModalToggled);
  const searchModalToggled = useSelector((state) => state.modals.searchModalToggled);

  const navigate = useNavigate();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getUser() {
    try {
      // todo - get username from session

      const urlSearchParams = new URLSearchParams({ username: "testusername" });

      const response = await fetch(
        `http://localhost:4000/auth/get-user-profile-simple/${urlSearchParams}`
      );

      if (!response.ok) {
        throw new Error(
          response.statusText || "There was a problem at get-user-profile-simple"
        );
      }
      const data = await response.json();

      if (!data[0]) {
        setSessionLoading(false);
        return;
      }

      const { data: data2 } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(data[0].profile_picture_path || "placeholders/user-placeholder");

      const newUser = {
        ...passedSession.user,
        ...data[0],
        profile_picture_url: data2.publicUrl,
      };

      if (!session) {
        dispatch(setUser(newUser));
        dispatch(
          setSession({
            ...passedSession,
            user: newUser,
          })
        );
      }

      setSessionLoading(false);
    } catch (error) {
      console.error(error);
      setError(error.toString());
      setSessionLoading(false);
    }
  }

  // const onAuthStateChange = (callback) => {
  //   console.log("onAuthStateChange, 'callback' arg:", callback);
  //   let currentSession;
  //   return supabase.auth.onAuthStateChange((event, _session) => {
  //     console.log({event, _session})
  //     if (currentSession && _session?.user?.id == currentSession?.user?.id) return;
  //     currentSession = _session;
  //     if (!_session) setSessionLoading(false);
  //     else getUser(_session);
  //     // if (_session) {
  //     //   getUser(_session);
  //     // } else {
  //     //   setSessionLoading(false);
  //     // }

  //     callback(event);
  //   });
  // };

  useEffect(() => {
    if (!session && !sessionLoading) navigate("/login");
    // getUser();
    setSessionLoading(false);
  }, []);

  if (sessionLoading)
    return (
      <LoadingOverlay message={"Loading..."} verticalAlignment={"center"} zIndex={3} />
    );

  return (
    <>
      {isOnMobile() ? <MobileBottomNav /> : <Navbar />}
      {error && (
        <ErrorBanner error={error.toString()} handleCloseBanner={() => setError(null)} />
      )}
      <Routes>
        <Route path="*" element={<p>Page not found</p>} />
        <Route element={<Listings />} path="/" />
        <Route element={<Register />} path="/register" />
        <Route element={<Login />} path="/login" />
        <Route
          element={<PrivateRoutes session={session} sessionLoading={sessionLoading} />}
        >
          <Route path="/sell" element={<Sell />} />
          <Route path="/wanted" element={<CreateWantedItem />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Route>
        <Route path="/user/:username" element={<UserProfile />} />
        <Route element={<Item />} path="/listing/:itemID" />
        <Route element={<WantedItem />} path="/wanted/:wantedItemID" />
        <Route element={<ResetPassword />} path="/reset-password" />
      </Routes>
      {loginModalToggled && <LoginModal />}
      {registerModalToggled && <RegisterModal />}
      {resetPasswordModalToggled && <ResetPasswordModal />}
      {bugModalToggled && <BugModal />}
      {feedbackModalToggled && <FeedbackModal />}
      {searchModalToggled && <SearchModal />}
      {/* </main> */}
    </>
  );
}
