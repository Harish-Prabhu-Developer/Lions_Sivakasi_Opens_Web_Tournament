import { User } from "lucide-react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

export const CustomInput = ({
  label,
  type = "text",
  placeholder = "",
  IconType = User,
  value,
  onChange,
  autoComplete,
  name,
  error,
  style = {},
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  // Explicitly destructure to prevent DOM warnings
  setShowPassword: _setShowPassword,
  showPassword: _showPassword,
  togglePassword: _togglePassword,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const Icon = IconType;
  const showIcon = type !== "hidden";

  const borderColorClass = error
    ? "border-red-500"
    : focused
    ? "border-cyan-500 ring-2 ring-cyan-400"
    : "border-cyan-500/10";

  const inputType =
    type === "password" && !showPassword
      ? "password"
      : type === "password" && showPassword
      ? "text"
      : type;

  const handleFocus = (e) => {
    setFocused(true);
    onFocusProp?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlurProp?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className="text-cyan-100 font-medium spacy tracking-wide"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div className="p-1" />
      <div
        className={`relative flex items-center rounded-lg border ${borderColorClass} bg-[#13192c] min-h-[52px] px-3 transition-all duration-300`}
      >
        {showIcon && (
          <Icon
            size={`${type === "date" ? "20" : "22"}`}
            className="mr-2 text-cyan-400"
          />
        )}
        <input
          ref={inputRef}
          id={name}
          type={inputType}
          name={name}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white outline-none text-base py-3 px-0 appearance-none"
          autoComplete={autoComplete}
          maxLength={type === 'tel' ? 15 : undefined}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          {...rest}
        />
      </div>
      {error && <span className="text-red-400 text-xs mt-1 block">{error}</span>}
    </div>
  );
};
