import { Link } from "react-router-dom";
import { supabase } from "../../../utils/supabase";
import "./ListingList.css";
import { getTimeAgo } from "../../../utils/usefulFunctions";
import { GearIcon } from "../Icons/GearIcon";

export const ListingList = ({ listings, isOnUserProfile }) => {
  return (
    <ul className="listing-list">
      {listings.map((listing) => {
        const { data } = supabase.storage.from("item_images").getPublicUrl(listing.path);
        const imageUrl = data.publicUrl;

        let truncatedDetailsText = listing.details;

        if (truncatedDetailsText.length > 200) {
          truncatedDetailsText = truncatedDetailsText.slice(0, 150).trim() + "...";
        }

        return (
          <li key={listing.id}>
            <div className="image-wrapper">
              <Link
                className="image-container"
                to={`/listing/${listing.id}?back-ref=dashboard`}
              >
                <img src={imageUrl} />
              </Link>
              {listing.image_count > 1 && (
                <p className="small-text photo-count">{listing.image_count} Photos</p>
              )}
            </div>
            <div className="info">
              <Link className="what-is-this" to={`/listing/${listing.id}`}>
                {listing.what_is_this}
              </Link>
              <p className="small-text details">{truncatedDetailsText}</p>
              <p className="small-text condition">
                <strong>Condition:</strong> {listing.condition}
              </p>
              {!isOnUserProfile && (
                <>
                  <p className="small-text location">
                    <strong>Location:</strong> {listing.city}, {listing.state}
                  </p>
                  <p className="seller small-text">
                    <strong>Seller: </strong>
                    <Link to={`/user/${listing.username}`}>{listing.username}</Link>
                  </p>
                </>
              )}
              <p className="small-text">
                <strong>Listed </strong> {getTimeAgo(new Date(listing.created_dttm))}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
