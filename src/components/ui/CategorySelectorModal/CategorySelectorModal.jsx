import { useDispatch } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { CategorySelector } from "../CategorySelector/CategorySelector";
import { XIcon } from "../../ui/Icons/XIcon";
import { ModalOverlay } from "../ModalOverlay/ModalOverlay";
import "./CategorySelectorModal.css";

export const CategorySelectorModal = ({
  categories,
  handleCategoryClick = () => null,
  handleModalClick = () => null,
  handleApply = () => null,
  applyDisabled,
  handleExpandAll = () => null,
  handleCollapseAll = () => null,
  zIndex = 2,
  showResultNumbers
}) => {
  const dispatch = useDispatch();

  return (
    <>
      <div className="modal category-selector-modal" style={{ zIndex }}>
        <div className="header">
          <h3>Select a category</h3>
          <button
            title="Close this menu"
            className="button"
            onClick={() =>
              dispatch(toggleModal({ key: "categorySelectorModal", value: false }))
            }
          >
            Close <XIcon />
          </button>
        </div>
        <CategorySelector
          forModal={true}
          categories={categories}
          handleCategoryClick={handleCategoryClick}
          handleExpandAll={handleExpandAll}
          handleCollapseAll={handleCollapseAll}
          showResultNumbers={showResultNumbers}
        />
        <div className="buttons">
          <button
            className="button"
            type="button"
            onClick={handleApply}
            disabled={applyDisabled}
          >
            Apply
          </button>
        </div>
      </div>

      <ModalOverlay
        zIndex={zIndex - 1}
        onClick={() => {
          dispatch(toggleModal({ key: "categorySelectorModal", value: false }));
          handleModalClick();
        }}
      />
    </>
  );
};
