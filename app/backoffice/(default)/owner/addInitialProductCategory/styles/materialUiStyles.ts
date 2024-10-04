export const customStyles = {
  control: (base, state) => ({
    ...base,
    fontFamily: "Roboto, sans-serif",
    fontSize: 16,
    borderColor: state.isFocused ? "#3f51b5" : "#c4c4c4",
    boxShadow: state.isFocused
      ? "0 0 0 0.2rem rgba(63, 81, 181, 0.25)"
      : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#3f51b5" : "#c4c4c4",
    },
    borderRadius: 4,
    padding: "10px",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 4,
    marginTop: 0,
    fontFamily: "Roboto, sans-serif",
    zIndex: 9999,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(63, 81, 181, 0.1)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#3f51b5",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#3f51b5",
    ":hover": {
      backgroundColor: "rgba(63, 81, 181, 0.3)",
      color: "white",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#aab7c4",
  }),
};
