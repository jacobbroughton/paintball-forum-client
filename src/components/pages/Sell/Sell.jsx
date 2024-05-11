import { useRef, useState } from "react";
import LoadingOverlay from "../../ui/LoadingOverlay/LoadingOverlay.jsx";
import ToggleButton from "../../ui/ToggleButton/ToggleButton";
import { Link, redirect, useNavigate } from "react-router-dom";
import "./Sell.css";
import { supabase } from "../../../utils/supabase";
import { batch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import TrashIcon from "../../ui/Icons/TrashIcon";
import StarIcon from "../../ui/Icons/StarIcon";
import { read, readFile, writeFileXLSX } from "xlsx";

// const yearArr = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
const brandArr = [
  "Planet Eclipse",
  "Dye Precision",
  "Empire Paintball",
  "Field One Paintball",
  "DLX Technologies",
  "MacDev",
  "Virtue Paintball",
  "Shocker Paintball",
  "Tiberius Arms",
  "Dangerous Power",
];
const modelArr = [
  "CS2",
  "M3+",
  "Vanquish GT",
  "Luxe X",
  "Etha 2",
  "DSR",
  "Axe Pro",
  "Luxe Ice",
  "Geo 4",
  "CZR",
];

const conditionOptions = [
  "Brand New, Never Used",
  "Like New",
  "Used",
  "Used, Needs Work",
  "Inoperable",
];

const priceArr = [150, 200, 400, 440, 1300, 1140, 1150, 1900, 800, 241];
// const frameSizeArr = ["XL", "L", "M", "S", "XS"];
// const wheelSizeArr = ['20"', '24"', '26"', '27.5"', '29"', "650b"];
const conditionArr = ["New", "Used"];

// const randomYear = yearArr[Math.floor(Math.random() * yearArr.length)];
const randomBrand = brandArr[Math.floor(Math.random() * brandArr.length)];
const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
const randomPrice = priceArr[Math.floor(Math.random() * priceArr.length)];
// const randomWheelSize = wheelSizeArr[Math.floor(Math.random() * wheelSizeArr.length)];
// const randomFrameSize = frameSizeArr[Math.floor(Math.random() * frameSizeArr.length)];
const randomCondition = conditionArr[Math.floor(Math.random() * conditionArr.length)];
// const randomFrontTravel = Math.floor(Math.random() * (200 - 1 + 1)) + 1;
// const randomRearTravel = Math.floor(Math.random() * (200 - 1 + 1)) + 1;

const Sell = () => {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [brand, setBrand] = useState(randomBrand);
  const [model, setModel] = useState(randomModel);
  const [price, setPrice] = useState(randomPrice);
  const [details, setDetails] = useState("");
  const [condition, setCondition] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [trades, setTrades] = useState(null);
  const [negotiable, setNegotiable] = useState(null);
  const [buyerPaysShipping, setBuyerPaysShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [location, setLocation] = useState("Matthews, NC");
  const [contactPhoneNumber, setContactPhoneNumber] = useState("7047708371");
  const [sellerName, setSellerName] = useState("Jacob Broughton");
  const [generatedGroupId, setGeneratedGroupId] = useState(uuidv4());
  const [newCoverPhotoId, setNewCoverPhotoId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [sellError, setSellError] = useState("");
  const [listedItemID, setListedItemID] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatIsThisItem, setWhatIsThisItem] = useState(randomBrand + " " + randomModel);
  const [radioOptions, setRadioOptions] = useState({
    conditionOptions: [
      { id: 0, value: "Brand New", checked: false },
      { id: 1, value: "Like New", checked: false },
      { id: 2, value: "Used", checked: false },
      { id: 3, value: "Not Functional", checked: false },
    ],
    shippingOptions: [
      { id: 0, value: "Willing to Ship", checked: false },
      { id: 1, value: "Local Only", checked: false },
    ],
    tradeOptions: [
      { id: 0, value: "Accepting Trades", checked: false },
      { id: 1, value: "No Trades", checked: false },
    ],
    negotiableOptions: [
      { id: 0, value: "Firm", checked: false },
      { id: 1, value: "OBO/Negotiable", checked: false },
    ],
  });
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  const [numPhotosUploaded, setNumPhotosUploaded] = useState(0);
  const [batchFile, setBatchFile] = useState(null);

  const { user } = useSelector((state) => state.auth.session);

  function handleDragEnter(e) {
    e.preventDefault();
    setDraggingPhotos(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDraggingPhotos(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDraggingPhotos(false);

    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    } else {
      throw "Something happened while dropping images";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("add_item", {
        p_brand: brand,
        p_created_by_id: user.id,
        p_details: details,
        p_location: "Matthews, NC",
        p_model: model,
        p_price: price,
        p_status: "Available",
        p_what_is_this: whatIsThisItem,
        p_shipping: shipping,
        p_trades: trades,
        p_negotiable: negotiable,
        p_condition: condition,
        p_shipping_cost: shippingCost,
      });

      if (!data) throw "Listed item id is undefined";

      if (newCoverPhotoId /* put selected new cover photo id here */)
        await supabase.rpc("update_cover_photo", {
          p_item_id: data,
          p_image_id: newCoverPhotoId,
        });

      const imagePaths = photos.map(
        (photo) => `${user.id}/${generatedGroupId}/${photo.name}`
      );

      const { data: movedImagesFromTempTableData, error: error2 } = await supabase.rpc(
        "move_item_images_from_temp",
        { p_item_id: data, p_group_id: generatedGroupId }
      );

      imagePaths.forEach(async (path) => {
        const { data, error: error2 } = await supabase.storage
          .from("item_images")
          .move(`temp/${path}`, `saved/${path}`);
      });
      setListedItemID(data);
      navigate(`/${data}`);
    } catch (e) {
      console.error(e);
      if (typeof e === "string") {
        setSellError(e);
      } else if (e instanceof Error) {
        setSellError(e.message);
      }
      setLoading(false);
    }
  }

  // async function handleBatchFileUploadDrop(file) {
  //   try {
  //     const newFile = await (await fetch(file.name)).arrayBuffer();
  //     console.log(newFile)
  //     if (!file) throw "No batch file provided";

  //     const reader = new FileReader();

  //     reader.onload = function (e) {
  //       const data = e.target.result;
  //       const workbook = read(data);

  //       console.log(workbook);
  //     };

  //     // const workbook = read(file.name);
  //     reader.readAsArrayBuffer(file);
  //   } catch (error) {
  //     setSellError(error.toString());
  //   }
  // }

  let index = 0;
  async function handleImageUpload(imageFiles) {
    const tempImages = [];

    setImagesUploading(true);

    if (numPhotosUploaded == 0) {
      index += 1;
      setNumPhotosUploaded(index);
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const thisUploadUUID = uuidv4();
      const file = imageFiles[i];
      const { data, error } = await supabase.storage
        .from("item_images")
        .upload(`temp/${user.id}/${generatedGroupId}/${thisUploadUUID}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (i == imageFiles.length - 1) {
        setImagesUploading(false);
      }

      if (error) {
        console.error(error);
        return;
      }

      const { data: data2, error: error2 } = await supabase.rpc("add_item_photo_temp", {
        p_group_id: generatedGroupId,
        p_generated_id: data.id,
        p_full_path: data.fullPath,
        p_path: data.path,
        p_is_cover: i == 0 ? 1 : 0,
        p_created_by_id: user.id,
      });
      if (error2) console.error(error2);

      console.log("add item photo temp", data2);
      tempImages.push(data2[0]);

      index += 1;
      setNumPhotosUploaded(index);
    }

    const { data, error } = await supabase.storage
      .from("item_images")
      .list(`temp/${user.id}/${generatedGroupId}/`, {
        limit: 100,
        offset: 0,
      });
    if (data !== null) {
      console.log(data);
      setNewCoverPhotoId(data[0]);
      setPhotos(
        data.map((photo, i) => ({
          ...photo,
          is_cover: i == 0,
        }))
      );
    } else {
      alert("error uploading images");
    }
  }

  function handleNewCoverImage(clickedPhoto) {
    setNewCoverPhotoId(clickedPhoto.id);
    setPhotos(
      photos.map((photo) => ({
        ...photo,
        is_cover: photo.id == clickedPhoto.id,
      }))
    );
  }

  function handleStateReset() {
    setImagesUploading(false);
    setBrand(randomBrand);
    setModel(randomModel);
    setPrice(randomPrice);
    setDetails("");
    setCondition(randomCondition);
    setShipping(null);
    setTrades(null);
    setNegotiable(null);
    // setBuyerPaysShipping(null);
    setLocation("Matthews, NC");
    setContactPhoneNumber("7047708371");
    setSellerName("Jacob Broughton");
    setGeneratedGroupId(uuidv4());
    setNewCoverPhotoId(null);
    setPhotos([]);
    // setPhotoFiles(null);
    setSellError("");
    setListedItemID(false);
    setLoading(false);
    setWhatIsThisItem(randomBrand + " " + randomModel);
    setRadioOptions({
      conditionOptions: [
        { id: 0, value: "Brand New", checked: false },
        { id: 1, value: "Like New", checked: false },
        { id: 2, value: "Used", checked: false },
        { id: 3, value: "Not Functional", checked: false },
      ],
      shippingOptions: [
        { id: 0, value: "Willing to Ship", checked: false },
        { id: 1, value: "Local Only", checked: false },
      ],
      tradeOptions: [
        { id: 0, value: "Accepting Trades", checked: false },
        { id: 1, value: "No Trades", checked: false },
      ],
      negotiableOptions: [
        { id: 0, value: "Firm", checked: false },
        { id: 1, value: "OBO/Negotiable", checked: false },
      ],
    });
  }

  async function handleImageDelete(image) {
    const { data, error } = await supabase.rpc("delete_temp_image", {
      p_image_name: `temp/${user.id}/${generatedGroupId}/${image.name}`,
    });

    const photosLeft = photos.filter((photo) => photo.id != image.id);

    if (!error) setPhotos(photosLeft);

    if (photosLeft.length === 0 && imageInputRef.current)
      imageInputRef.current.value = "";

    // TODO - need to delete from storage as well
  }

  async function handleDiscardImages(e) {
    try {
      e.preventDefault();
      // todo - need to delete from tables as well

      console.log("photos - discard images", photos);
      const paths = photos.map(
        (photo) => `temp/${user.id}/${generatedGroupId}/${photo.name}`
      );

      console.log("paths", paths);

      const { data, error } = await supabase.storage.from("item_images").remove(paths);

      const { data: data2, error: error2 } = await supabase.rpc("delete_temp_images", {
        p_user_id: user.id,
        p_group_id: generatedGroupId,
      });

      console.log(data2);

      setPhotos([]);
      setNumPhotosUploaded(0)
    } catch (error) {
      setSellError(error.toString());
    }
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = [];

  for (let i = currentYear + 2; i > currentYear + 2 - 100; i--) {
    yearOptions.push(i);
  }

  return (
    <div className="sell">
      {sellError && <div className="sell-error">{sellError}</div>}
      <h1>Create a new listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-block">
          {photos.length != 0 && (
            <div className="selling-item-images">
              {photos?.map((image) => {
                return (
                  <div
                    className={`image-container ${
                      image.id == newCoverPhotoId ? "cover" : ""
                    }`}
                    // title={image.name}
                    onClick={() => handleNewCoverImage(image)}
                  >
                    {image.is_cover && (
                      <StarIcon title="Marked as 'cover image'. Meaning this image will show in the feed of items for sale, and will be featured on the item listing." />
                    )}
                    <img
                      src={`https://mrczauafzaqkmjtqioan.supabase.co/storage/v1/object/public/item_images/temp/${user.id}/${generatedGroupId}/${image.name}?width=73&height=73`}
                    />
                    <div className="image-overlay">
                      <div className="buttons">
                        <button
                          className="delete-button"
                          type="button"
                          onClick={(e) => handleImageDelete(image)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {photos.length == 0 ? (
            <div className="image-input-and-prompt">
              {imagesUploading && !numPhotosUploaded ? (
                <p className="images-uploading">Uploading...</p>
              ) : imagesUploading && numPhotosUploaded ? (
                <div className="image-skeletons">
                  {Array.from(Array(numPhotosUploaded)).map((item, i) => (
                    <div key={i} className="image-skeleton">
                      &nbsp;
                    </div>
                  ))}
                </div>
              ) : (
                <label
                  className={`custom-photo-upload ${
                    photos.length > 0 ? "secondary" : ""
                  } ${draggingPhotos ? "dragging" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <p>Add Photos</p>
                  <p>or drag and drop</p>
                  <input
                    onChange={(e) => handleImageUpload(e.target.files)}
                    type="file"
                    multiple
                    accept=".jpg"
                    name="photos"
                    ref={imageInputRef}
                  />
                </label>
              )}
            </div>
          ) : (
            <button onClick={handleDiscardImages} className="reset-images-button">
              <TrashIcon /> Discard & Upload New Images
            </button>
          )}
          {/* <input
            type="file"
            onDrop={(e) => handleBatchFileUploadDrop(e.dataTransfer.files[0])}
          /> */}
        </div>

        <div className="form-block">
          <h2>Your Info</h2>
          <fieldset>
            <div className="form-group">
              <label>Full Name</label>
              <input
                onChange={(e) => setSellerName(e.target.value)}
                value={sellerName}
                placeholder="Seller's Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Phone Number </label>
              <input
                onChange={(e) => setContactPhoneNumber(e.target.value)}
                value={contactPhoneNumber}
                placeholder="Contact Phone Number"
                required
              />
            </div>
          </fieldset>
          <div className="form-group">
            <label>Location</label>
            <input
              onChange={(e) => setLocation(e.target.value)}
              value={location}
              placeholder="Location"
            />
          </div>
        </div>

        <div className="form-block">
          <h2>Item Details</h2>

          <fieldset>
            <div className="form-group">
              <label>What is this item?</label>
              <input
                onChange={(e) => setWhatIsThisItem(e.target.value)}
                value={whatIsThisItem}
                placeholder='e.g. "GI Cut Planet Eclipse LV1"'
              />
            </div>
            <div className="form-group price">
              <label>Price</label>
              <input
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                placeholder="Price"
                required
              />
            </div>
          </fieldset>

          <fieldset className="prices">
            <div className="form-group shipping">
              <label>Shipping</label>
              <div className="shipping-selector-and-input">
                <div className="shipping-selector">
                  <button
                    className={`shipping-toggle-button ${
                      !buyerPaysShipping ? "selected" : ""
                    }`}
                    type="button"
                    onClick={() => setBuyerPaysShipping(false)}
                  >
                    Free/Included
                  </button>
                  <button
                    className={`shipping-toggle-button ${
                      buyerPaysShipping ? "selected" : ""
                    }`}
                    type="button"
                    onClick={() => setBuyerPaysShipping(true)}
                  >
                    Buyer Pays
                  </button>
                </div>
                {/* <input
                  onChange={(e) => setShippingCost(e.target.value)}
                  value={shippingCost}
                  placeholder="$0"
                  required
                  disabled={!buyerPaysShipping}
                /> */}
              </div>
            </div>
            <div
              className={`form-group shipping-cost ${
                buyerPaysShipping ? "" : "disabled"
              }`}
            >
              <label>Shipping Cost</label>
              <input
                onChange={(e) => setShippingCost(e.target.value)}
                value={shippingCost}
                placeholder="$0"
                required
                disabled={!buyerPaysShipping}
              />
            </div>
          </fieldset>

          <fieldset>
            <div className="form-group">
              <label>Brand</label>
              <input
                onChange={(e) => setBrand(e.target.value)}
                value={brand}
                placeholder="Brand"
                required
              />
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                onChange={(e) => setModel(e.target.value)}
                value={model}
                placeholder="Model"
                required
              />
            </div>
          </fieldset>
          {/* <fieldset>


            <div className="form-group">
              <label>Condition</label>
              <select onChange={(e) => setCondition(e.target.value)} value={condition}>
                {radioOptions.conditionOptions.map((condition) => (
                  <option value={condition}>{condition.value}</option>
                ))}
              </select>
            </div>
          </fieldset> */}

          <div className="form-group">
            <label>Details</label>
            <textarea
              onChange={(e) => setDetails(e.target.value)}
              value={details}
              placeholder="Enter some details about the item you're selling"
            />
          </div>

          <fieldset className="radio-form-groups">
            <div className="form-group">
              <label>Shipping</label>
              {/* <select onChange={(e) => setCondition(e.target.value)} value={condition}> */}
              <div className="radio-options">
                {radioOptions.shippingOptions.map((option) => (
                  // <option value={condition}>{condition.value}</option>
                  <div className="radio-option">
                    <label>
                      <input
                        type="radio"
                        value={option.value}
                        checked={option.value == shipping}
                        onChange={() => setShipping(option.value)}
                      />{" "}
                      {option.value}
                    </label>
                  </div>
                ))}
              </div>
              {/* </select> */}
            </div>

            <div className="form-group">
              <label>Trades</label>
              <div className="radio-options">
                {radioOptions.tradeOptions.map((option) => (
                  // <option value={condition}>{condition.value}</option>
                  <div className="radio-option">
                    <label>
                      <input
                        type="radio"
                        value={option.value}
                        checked={option.value == trades}
                        onChange={() => setTrades(option.value)}
                      />{" "}
                      {option.value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div className="form-group">
              <label>Condition</label>
              <div className="radio-options">
                {radioOptions.conditionOptions.map((option) => (
                  // <option value={condition}>{condition.value}</option>
                  <div className="radio-option">
                    <label>
                      <input
                        type="radio"
                        value={option.value}
                        checked={option.value == condition}
                        onChange={() => setCondition(option.value)}
                      />{" "}
                      {option.value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Negotiable</label>
              <div className="radio-options">
                {radioOptions.negotiableOptions.map((option) => (
                  // <option value={negotiable}>{negotiable.value}</option>
                  <div className="radio-option">
                    <label>
                      <input
                        type="radio"
                        value={option.value}
                        checked={option.value == negotiable}
                        onChange={() => setNegotiable(option.value)}
                      />{" "}
                      {option.value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
        </div>
        <div className="submit-container">
          {photos?.length == 0 && (
            <p className="warning">
              Please upload at least 1 photo of the item you're selling
            </p>
          )}
          <button
            type="submit"
            disabled={
              photos.length == 0 || !condition || !trades || !shipping || !negotiable
            }
          >
            Submit
          </button>
        </div>
      </form>
      {listedItemID && (
        <>
          <div className="success-modal">
            <h2>Success</h2>
            <Link to={`/${listedItemID}`}>Go To Listing</Link>
            <Link to="/">View All Listings</Link>
            <button onClick={() => handleStateReset()}>Create Another Listing</button>
          </div>
          <div className="success-modal-overlay"></div>
        </>
      )}
      {loading && <LoadingOverlay message="Listing your item for sale..." />}
    </div>
  );
};
export default Sell;
