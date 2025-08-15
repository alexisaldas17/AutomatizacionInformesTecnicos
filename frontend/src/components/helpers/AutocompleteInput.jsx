/* const AutocompleteInput = ({ label, name, value, options, onChange, onSelect, showSuggestions, setShowSuggestions, refEl }) => (
  <div className="autocomplete-container" ref={refEl}>
    <label>{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      autoComplete="off"
    />
    {showSuggestions && value && (
      <ul className="sugerencias">
        {options
          .filter(item => item.toLowerCase().includes(value.toLowerCase()))
          .map((item, i) => (
            <li key={i} onClick={() => onSelect(name, item)}>{item}</li>
          ))}
      </ul>
    )}
  </div>
);

export default AutocompleteInput; */
