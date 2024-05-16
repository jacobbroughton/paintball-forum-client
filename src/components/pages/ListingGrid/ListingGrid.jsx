import { Link } from "react-router-dom";
import "./ListingGrid.css";

const ListingGrid = ({ listings }) => {
  return (
    <div className="grid">
      {listings?.map((listing) => (
        <Link
          to={`/${listing.id}`}
          key={listing.id}
          title={listing.what_is_this}
        >
          <div className="grid-item">
            <div className="image-container">
              {listing.path ? (
                <img
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/${listing?.path}`}
                />
              ) : (
                <img
                  src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/placeholders/placeholder.jpg`}
                />
              )}
            </div>
            <div className="listing-card-info">
              <p className="price">${listing.price}</p>
              <p className="what-is-this">{listing.what_is_this}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
export default ListingGrid;