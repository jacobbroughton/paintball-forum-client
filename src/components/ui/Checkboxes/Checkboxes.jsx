import { Checkbox } from "../Icons/Checkbox";
import "./Checkboxes.css";

export const Checkboxes = ({
  options,
  handleCheckboxOptionClick,
  disabled,
  size = "small",
}) => {
  return (
    <div className={`checkbox-options ${disabled ? "disabled" : ""} `}>
      {options.map((option) => (
        <div
          className={`checkbox-option ${option.checked ? "checked" : ""} ${size}`}
          onClick={() => handleCheckboxOptionClick(option)}
          key={option.id}
          title={`${option.checked ? "Uncheck" : "Check"} "${option.value}"`}
        >
          <div className="box-container">
            {option.checked ? <div className="box"></div> : false}
          </div>
          <label>{option.value}</label>
        </div>
      ))}
    </div>
  );
};
