import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

const iconMap = {
  email: Mail,
  password: Lock,
  phone: Phone,
  text: User,
  address: User,
  name: User,
};

const CustomInput = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  autoComplete,
  name,
  error,
  style = {},
  onFocus: onFocusProp,
  onBlur: onBlurProp,
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

  const Icon = iconMap[type] || User;

  const borderColorClass = error
    ? "border-red-500"
    : focused
    ? "border-cyan-500 ring-2 ring-cyan-400"
    : "border-cyan-500/10";

  const inputType = type === "password" && !showPassword ? "password" : "text";

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
        <label className="text-gray-300 text-sm font-medium mb-1 block" htmlFor={name}>
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-lg border ${borderColorClass} bg-[#13192c] min-h-[52px] px-3 transition-all duration-300`}
      >
        <Icon className="w-5 h-5 mr-3 text-cyan-400" />
        <input
          ref={inputRef}
          id={name}
          type={inputType}
          name={name}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white outline-none text-base py-3"
          autoComplete={autoComplete}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          {...rest}
        />
        {/* {type === "password" && (
          <button
            type="button"
            className="ml-2 text-cyan-300 hover:text-cyan-200 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )} */}
      </div>
      {error && <span className="text-red-400 text-xs mt-1 block">{error}</span>}
    </div>
  );
};

export default CustomInput;
