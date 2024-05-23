import { Link, useParams } from "react-router-dom";
import "./UserProfile.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase";
import { useDispatch, useSelector } from "react-redux";
import ListingGrid from "../../ui/ListingGrid/ListingGrid";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay";
import Stars from "../../ui/Stars/Stars";
import { toggleModal } from "../../../redux/modals";
import { v4 as uuidv4 } from "uuid";
import EditIcon from "../../ui/Icons/EditIcon";
import ItemSkeleton from "../../ui/Skeletons/ItemSkeleton/ItemSkeleton";

const UserProfile = () => {
  // const { userID } = useParams();
  const dispatch = useDispatch();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({
    count: 0,
    list: [],
  });
  const [profilePictureUpdateButtonShowing, setProfilePictureUpdateButtonShowing] =
    useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const { session } = useSelector((state) => state.auth);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_profile_complex", {
        p_user_id: session.user.id,
      });

      if (error) {
        console.log(error);
        throw error.message;
      }

      console.log(data);
      setProfilePicture(data[0].profile_picture_path)

      // Get Items
      const { data: data2, error: error2 } = await supabase.rpc("get_items", {
        p_search_value: "",
        p_brand: "",
        p_model: "",
        p_min_price: 0,
        p_max_price: null,
        p_state: "",
        p_condition: [
          { id: 0, value: "Brand New", checked: true },
          { id: 1, value: "Like New", checked: true },
          { id: 2, value: "Used", cdhecked: true },
          { id: 3, value: "Heavily Used", checked: true },
          { id: 4, value: "Not Functional", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: [
          { id: 0, value: "Willing to Ship", checked: true },
          { id: 1, value: "Local Only", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: [
          { id: 0, value: "Accepting Trades", checked: true },
          { id: 1, value: "No Trades", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: [
          { id: 0, value: "Firm", checked: true },
          { id: 1, value: "OBO/Negotiable", checked: true },
        ]
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_sort: "Date Listed (New-Old)",
        p_seller_id: session.user.id,
        p_city: "",
      });

      if (error2) throw error2.message;
      if (!data2) throw "No listings available";

      setListings(data2);

      console.log({ data2, error2 });
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  }

  async function uploadProfilePicture(e) {
    try {
      console.log(e.target.files);

      const thisUploadUUID = uuidv4();
      const file = e.target.files[0];
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .upload(`${session.user.id}/${thisUploadUUID}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log({ data, error });

      if (error) {
        console.log(error);
        throw error.message;
      }

      const { data: data2, error: error2 } = await supabase.rpc("add_profile_image", {
        p_generated_id: data.id,
        p_full_path: data.fullPath,
        p_path: data.path,
        p_user_id: session.user.id,
      });
      if (error2) throw error2.message;

      console.log("add profile image", data2);

      setProfilePicture(data2[0].full_path);
    } catch (error) {
      console.log(error);
      setError(error.toString());
    }
  }

  if (error) return <p>{error}</p>;

  if (loading) return <LoadingOverlay />;

  return (
    <div className="user-profile-page">
      {error && <p className="error-text small-text">{error}</p>}
      <div className="picture-and-info">
        <div
          className="profile-picture-container"
          onMouseEnter={() => setProfilePictureUpdateButtonShowing(true)}
          onMouseLeave={() => setProfilePictureUpdateButtonShowing(false)}
        >
          <img className="profile-picture" src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/${profilePicture}`}/>
          <label htmlFor="change-profile-picture">
            <input
              type="file"
              className=""
              id="change-profile-picture"
              onChange={uploadProfilePicture}
            />
            <EditIcon />
          </label>
        </div>
        <div className="info">
          <h1>{session.user.username}</h1>
          <p>Member since {new Date(session.user.created_at).toLocaleDateString()}</p>
          <button
            className="stars-button"
            onClick={() =>
              dispatch(toggleModal({ key: "userReviewsModal", value: true }))
            }
          >
            <Stars rating={session.user.rating} /> <span>({reviews.count})</span>
          </button>
          {/* {!seller.review_given && (
                <button
                  className="button add-review-button"
                  onClick={() =>
                    dispatch(
                      toggleModal({
                        key: "addReviewModal",
                        value: !modals.addReviewModalToggled,
                      })
                    )
                  }
                >
                  Leave a review
                </button>
              )} */}
        </div>
      </div>
      {listings.length ? (
        <ListingGrid listings={listings} />
      ) : (
        <div className="skeletons-grid">
          <div className="overlay-content">
            <p>You haven't created any listings yet!</p>
            <Link to="/sell">Sell something</Link>
          </div>
          <div className="gradient-overlay"></div>
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
          <ItemSkeleton blinking={false} />
        </div>
      )}
    </div>
  );
};
export default UserProfile;
