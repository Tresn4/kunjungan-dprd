import React from 'react'

const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        className="block text-sm text-white mb-2"
      >
        {label} {required && <span className="text-red-300">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows="4"
          className="w-full px-3 py-2 bg-white rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={type === 'number' ? "1" : undefined}
          className="w-full px-3 py-2 bg-white rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
      )}
    </div>
  )
}

export default FormInput