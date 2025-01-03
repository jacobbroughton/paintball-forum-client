import { Link } from "react-router-dom";
import { ItemSkeleton } from "../Skeletons/ItemSkeleton/ItemSkeleton";
import { LoadingOverlay } from "../LoadingOverlay/LoadingOverlay";
import "./SkeletonsListingGrid.css";

export const SkeletonsListingGrid = ({
  message = '',
  link,
  accountsForSidebar = false,
  hasOverlay,
  blinking = false,
  numSkeletons = 10,
  heightPx = 10,
  loading,
}) => {
  return (
    <div
      className={`skeletons-grid ${accountsForSidebar ? "accounts-for-sidebar" : ""}`}
      style={{ ...(heightPx && { height: `${heightPx}px` }) }}
    >
      {hasOverlay && (
        <>
          <div className="overlay-content">
            <p>{message}</p>
            {link && <Link to={link.url}>{link.label}</Link>}
          </div>
        </>
      )}

      {[...new Array(numSkeletons)].map((num, i) => (
        <ItemSkeleton key={i} blinking={blinking} />
      ))}
      {loading && <LoadingOverlay zIndex={3} />}
    </div>
  );
};
