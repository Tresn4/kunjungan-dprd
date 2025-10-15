import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const FileUpload = ({ onFileSelect, selectedFile }) => {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    } else if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        onFileSelect(null)
      }
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  })

  return (
    <div
      {...getRootProps()}
      className="file-upload-zone"
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center">
        <svg 
          className="w-10 h-10"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
          />
        </svg>
        
        {selectedFile ? (
          <div className="text-center">
            <p className="font-medium">
              {selectedFile.name}
            </p>
            <p>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium">
              {isDragActive 
                ? "Lepaskan file di sini..." 
                : "Drag dan drop file atau klik untuk memilih"
              }
            </p>
            <p>
              Format: PDF, DOC, DOCX, JPG, PNG (Maks. 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload