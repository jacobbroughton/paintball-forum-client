import "./Home.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabase.js";
import useWindowSize from "../../../utils/useWindowSize";
import ListingGrid from "../../ui/ListingGrid/ListingGrid.jsx";
import FiltersSidebar from "../../ui/FiltersSidebar/FiltersSidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals.js";
import ItemSkeleton from "../../ui/Skeletons/ItemSkeleton/ItemSkeleton.jsx";
import ModalOverlay from "../../ui/ModalOverlay/ModalOverlay.jsx";
import FilterIcon from "../../ui/Icons/FilterIcon.jsx";
import { setFlag } from "../../../redux/flags.js";
import { setFiltersUpdated } from "../../../redux/filters.js";

function Listings() {
  const dispatch = useDispatch();
  const modals = useSelector((state) => state.modals);
  const flags = useSelector((state) => state.flags);
  const filters = useSelector((state) => state.filters);
  const search = useSelector((state) => state.search);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [draftSearchValue, setDraftSearchValue] = useState("");
  const [listingsError, setListingsError] = useState(null);
  const [sort, setSort] = useState("Date Listed (New-Old)");
  const windowSize = useWindowSize();
  const [sidebarNeedsUpdate, setSidebarNeedsUpdate] = useState(windowSize.width > 625);
  // const [views, setViews] = useState([
  //   {
  //     id: 0,
  //     label: "For Sale",
  //     toggled: true,
  //   },
  //   {
  //     id: 1,
  //     label: "Looking To Buy",
  //     toggled: false,
  //   },
  // ]);

  useEffect(() => {
    if (windowSize.width > 625) {
      dispatch(toggleModal({ key: "filtersSidebar", value: true }));
      setSidebarNeedsUpdate(true);
    }
    if (windowSize.width <= 625 && sidebarNeedsUpdate) {
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
      setSidebarNeedsUpdate(false);
    }
  }, [windowSize.width]);

  async function getListings(searchValue = "") {
    try {
      if (!listingsLoading) {
        setListingsLoading(true);
      }

      let { data, error } = await supabase.rpc("get_items", {
        p_search_value: searchValue,
        p_brand: filters.saved.brand,
        p_model: filters.saved.model,
        p_min_price: filters.saved.minPrice || 0,
        p_max_price: filters.saved.maxPrice,
        p_state: filters.saved.state == "All" ? null : filters.saved.state,
        p_condition: filters.saved.conditionOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_shipping: filters.saved.shippingOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_trades: filters.saved.tradeOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_negotiable: filters.saved.negotiableOptions
          .filter((option) => option.checked)
          .map((option) => option.value),
        p_sort: sort,
        p_seller_id: null,
        p_city: filters.saved.city == "All" ? null : filters.saved.city,
      });

      if (error) {
        console.error(error);
        throw error.message;
      }

      if (!data) throw "No listings available";

      data = data.map((item) => {
        const { data, error } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(item.profile_picture_path || "placeholders/user-placeholder");

        if (error) throw error.message;

        return {
          ...item,
          profile_picture: data.publicUrl,
        };
      });

      setListings(data);
      setListingsLoading(false);

      if (isInitialLoad) setIsInitialLoad(false);
      // if (filters.filtersUpdated) dispatch(setFiltersUpdated(false));
      if (flags.searchedListingsNeedsUpdate)
        dispatch(setFlag({ key: "searchedListingsNeedsUpdate", value: false }));
      dispatch(setFiltersUpdated(false));
    } catch (error) {
      setListingsError(error.toString());
    }
  }

  useEffect(() => {
    if (windowSize.width < 625)
      dispatch(toggleModal({ key: "filtersSidebar", value: false }));
  }, []);

  useEffect(() => {
    getListings(search.savedSearchValue);
  }, [sort]);

  useEffect(() => {
    if (filters.filtersUpdated) getListings(searchValue);
  }, [filters.filtersUpdated]);

  useEffect(() => {
    if (flags.searchedListingsNeedsUpdate) getListings(search.savedSearchValue);
  }, [flags.searchedListingsNeedsUpdate]);

  // function handleSearchSubmit(e) {
  //   e.preventDefault();
  //   setSearchValue(draftSearchValue);

  //   getListings(draftSearchValue);
  // }

  return (
    <div className="home">
      <div className="sidebar-and-grid">
        {modals.filtersSidebarToggled && (
          <>
            <FiltersSidebar />
            {windowSize.width <= 625 && (
              <ModalOverlay
                zIndex={4}
                onClick={() =>
                  dispatch(toggleModal({ key: "filtersSidebar", value: false }))
                }
              />
            )}
          </>
        )}
        <div
          className={`${
            windowSize.width > 625 && modals.filtersSidebarToggled
              ? "has-sidebar-margin"
              : ""
          } listings-section`}
        >
          <div className="listings-controls">
            <div className="control-group sort">
              <p>Sort By:</p>
              <select onChange={(e) => setSort(e.target.value)} value={sort} id="select">
                <option>Alphabetically (A-Z)</option>
                <option>Alphabetically (Z-A)</option>
                <option>Price (Low-High)</option>
                <option>Price (High-Low)</option>
                <option>Date Listed (New-Old)</option>
                <option>Date Listed (Old-New)</option>
              </select>
            </div>
          </div>
          {listingsError ? (
            <p>{listingsError}</p>
          ) : listingsLoading ? (
            <div
              className={`${
                windowSize.width > 225 && modals.filtersSidebarToggled
                  ? "accounts-for-sidebar"
                  : ""
              } skeletons-grid`}
            >
              {[...new Array(listings.length || 5)].map((num, i) => (
                <ItemSkeleton key={i} />
              ))}
            </div>
          ) : !isInitialLoad && listings.length == 0 ? (
            <p>No listings available</p>
          ) : (
            <ListingGrid
              listings={listings}
              accountForSidebar={windowSize.width > 225 && modals.filtersSidebarToggled}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Listings;
