import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, User, Phone, Eye, EyeOff, Calendar } from 'lucide-react';

const iconMap = {
  email: Mail,
  password: Lock,
  phone: Phone,
  text: User,
  address: User,
  name: User,
  date: Calendar
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

  // For date input, display calendar icon
  const Icon = type !== "date" ? (iconMap[type] || User) : Calendar;
  const showIcon =  type !== "hidden";

  const borderColorClass = error
    ? "border-red-500"
    : focused
    ? "border-cyan-500 ring-2 ring-cyan-400"
    : "border-cyan-500/10";

  // Use password toggling only for password type
  const inputType =
    type === "password" && !showPassword ? "password"
    : type === "password" && showPassword ? "text"
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
        <label className="text-cyan-100 font-medium spacy tracking-wide"  htmlFor={name}>
          {label}
        </label>
      )}
      {/* Space between label and input container */}
      <div className="p-1"/>
      <div
        className={`relative flex items-center rounded-lg border ${borderColorClass} bg-[#13192c] min-h-[52px] px-3 transition-all duration-300`}
      >
        {showIcon && <Icon size={`${type === "date" ? "20" : "22"}`} className="mr-2 text-cyan-400" />}
        <input
          ref={inputRef}
          id={name}
          type={inputType}
          name={name}
          placeholder={placeholder}
          className={`flex-1 bg-transparent text-white outline-none text-base py-3 px-0 appearance-none
            ${type === "date" ? " appearance-none pr-4" : ""}
          `}
          autoComplete={autoComplete}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={style}
          {...rest}
        />
        {/* Password Visibility Toggle
        {type === "password" && (
          <button
            type="submit"
            className="ml-2 text-cyan-300 hover:text-cyan-200 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {/* Date Icon (shows at end for date input only) */}
        {/* {type === "date" && (
          <Calendar className="w-5 h-5 ml-2 text-cyan-400 pointer-events-none" />
        )}  */}
      </div>
      {error && <span className="text-red-400 text-xs mt-1 block">{error}</span>}
    </div>
  );
};

export default CustomInput;
