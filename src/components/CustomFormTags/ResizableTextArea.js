import React, { useState, useMemo, useCallback } from 'react';

// Enhanced textarea with user-adjustable sizing
const ResizableTextarea = ({ 
  item, 
  props, 
  handleInputChange, 
  renderValue, 
  getInputStyle 
}) => {
  // State for user's preferred sizing mode
  const [resizeMode, setResizeMode] = useState('auto'); // 'auto', 'manual', 'fixed'
  const [userHeight, setUserHeight] = useState(null);

  // Dynamic textarea styles based on resize mode
  const textareaStyle = useMemo(() => {
    const baseStyle = {
      minHeight: '48px',
      lineHeight: '1.3',
      transition: 'height 0.2s ease',
    };

    switch (resizeMode) {
      case 'auto':
        return {
          ...baseStyle,
          height: 'auto',
          resize: 'none',
          overflow: 'hidden',
        };
      case 'manual':
        return {
          ...baseStyle,
          height: userHeight || 'auto',
          resize: 'vertical',
          overflow: 'auto',
          minHeight: '48px',
          maxHeight: '300px',
        };
      case 'fixed':
        return {
          ...baseStyle,
          height: userHeight || '48px',
          resize: 'none',
          overflow: 'auto',
        };
      default:
        return baseStyle;
    }
  }, [resizeMode, userHeight]);

  // Auto-resize function
  const autoResize = useCallback((element) => {
    if (resizeMode === 'auto' && element) {
      element.style.height = 'auto';
      const newHeight = Math.max(48, element.scrollHeight);
      element.style.height = newHeight + 'px';
      
      // Store the computed height for potential mode switching
      setUserHeight(newHeight + 'px');
    }
  }, [resizeMode]);

  // Handle manual resize
  const handleManualResize = useCallback((element) => {
    if (resizeMode === 'manual' && element) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newHeight = entry.target.style.height;
          if (newHeight && newHeight !== userHeight) {
            setUserHeight(newHeight);
          }
        }
      });
      
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }
  }, [resizeMode, userHeight]);

  // Ref callback to handle different resize modes
  const textareaRef = useCallback((el) => {
    if (!el) return;

    // Auto-resize setup
    if (resizeMode === 'auto') {
      const handleInput = () => autoResize(el);
      setTimeout(() => autoResize(el), 0);
      el.addEventListener('input', handleInput);
      
      return () => el.removeEventListener('input', handleInput);
    }
    
    // Manual resize setup
    if (resizeMode === 'manual') {
      return handleManualResize(el);
    }
  }, [resizeMode, autoResize, handleManualResize]);

  // Toggle between resize modes
  const toggleResizeMode = useCallback(() => {
    const modes = ['auto', 'manual', 'fixed'];
    const currentIndex = modes.indexOf(resizeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setResizeMode(nextMode);
  }, [resizeMode]);

  // Get icon for current resize mode
  const getResizeIcon = () => {
    switch (resizeMode) {
      case 'auto': return 'fas fa-expand-arrows-alt';
      case 'manual': return 'fas fa-arrows-alt-v';
      case 'fixed': return 'fas fa-lock';
      default: return 'fas fa-expand-arrows-alt';
    }
  };

  // Get tooltip text for current mode
  const getTooltipText = () => {
    switch (resizeMode) {
      case 'auto': return 'Auto-resize (click for manual)';
      case 'manual': return 'Manual resize (click for fixed)';
      case 'fixed': return 'Fixed size (click for auto)';
      default: return 'Toggle resize mode';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
      <textarea
        ref={textareaRef}
        placeholder={renderValue(item.value)}
        value={props.formValues?.[item.id]?.value || ''}
        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
        className="form-control"
        disabled={item.isAutomatic}
        style={{
          ...getInputStyle(item.isAutomatic),
          ...textareaStyle,
          paddingRight: '40px', // Space for resize button
        }}
      />
      
      {/* Resize Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleResizeMode}
        className="btn btn-sm"
        title={getTooltipText()}
        style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          border: 'none',
          background: 'transparent',
          color: '#6c757d',
          padding: '4px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          opacity: 0.7,
          transition: 'all 0.2s ease',
          zIndex: 1,
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.backgroundColor = '#f8f9fa';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.7';
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <i className={getResizeIcon()} />
      </button>
      
      {/* Optional: Size indicator */}
      {resizeMode !== 'auto' && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            bottom: '8px',
            fontSize: '10px',
            color: '#adb5bd',
            background: 'rgba(255,255,255,0.9)',
            padding: '2px 4px',
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        >
          {userHeight || 'Auto'}
        </div>
      )}
    </div>
  );
};

// Alternative: Simpler version with just manual resize option
const SimpleResizableTextarea = ({ 
  item, 
  props, 
  handleInputChange, 
  renderValue, 
  getInputStyle 
}) => {
  const [allowManualResize, setAllowManualResize] = useState(false);

  const textareaStyle = useMemo(() => ({
    minHeight: '48px',
    height: allowManualResize ? 'auto' : 'auto',
    resize: allowManualResize ? 'vertical' : 'none',
    overflow: allowManualResize ? 'auto' : 'hidden',
    lineHeight: '1.3',
    transition: 'height 0.2s ease',
    maxHeight: allowManualResize ? '300px' : 'none',
  }), [allowManualResize]);

  const textareaRef = useCallback((el) => {
    if (!el) return;

    const autoResize = () => {
      if (!allowManualResize) {
        el.style.height = 'auto';
        el.style.height = Math.max(48, el.scrollHeight) + 'px';
      }
    };

    setTimeout(autoResize, 0);
    if (!allowManualResize) {
      el.addEventListener('input', autoResize);
      return () => el.removeEventListener('input', autoResize);
    }
  }, [allowManualResize]);

  

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        placeholder={renderValue(item.value)}
        value={props.formValues?.[item.id]?.value || ''}
        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
        className="form-control"
        disabled={item.isAutomatic}
        style={{
          ...getInputStyle(item.isAutomatic),
          ...textareaStyle,
          paddingRight: '35px',
        }}
      />
      
      {/* Toggle resize mode button */}
      <button
        type="button"
        onClick={() => setAllowManualResize(!allowManualResize)}
        className="btn btn-sm"
        title={allowManualResize ? 'Switch to auto-resize' : 'Allow manual resize'}
        style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          border: 'none',
          background: allowManualResize ? '#e3f2fd' : 'transparent',
          color: allowManualResize ? '#1976d2' : '#6c757d',
          padding: '4px 6px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <i className={allowManualResize ? 'fas fa-arrows-alt-v' : 'fas fa-expand-arrows-alt'} />
      </button>
    </div>
  );
};

// Enhanced version with size presets
const PresetResizableTextarea = ({ 
  item, 
  props, 
  handleInputChange, 
  renderValue, 
  getInputStyle 
}) => {
  const [selectedSize, setSelectedSize] = useState('auto');
  
  const sizePresets = {
    auto: { height: 'auto', resize: 'none', label: 'Auto' },
    small: { height: '60px', resize: 'none', label: 'Small' },
    medium: { height: '120px', resize: 'none', label: 'Medium' },
    large: { height: '200px', resize: 'none', label: 'Large' },
    manual: { height: '120px', resize: 'vertical', label: 'Manual' },
  };

  const textareaStyle = useMemo(() => ({
    minHeight: '48px',
    lineHeight: '1.3',
    overflow: selectedSize === 'auto' ? 'hidden' : 'auto',
    maxHeight: selectedSize === 'manual' ? '400px' : 'none',
    transition: 'height 0.3s ease',
    ...sizePresets[selectedSize],
  }), [selectedSize]);

  const textareaRef = useCallback((el) => {
    if (!el || selectedSize !== 'auto') return;

    const autoResize = () => {
      el.style.height = 'auto';
      el.style.height = Math.max(48, el.scrollHeight) + 'px';
    };

    setTimeout(autoResize, 0);
    el.addEventListener('input', autoResize);
    return () => el.removeEventListener('input', autoResize);
  }, [selectedSize]);
  

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        placeholder={renderValue(item.value)}
        value={props.formValues?.[item.id]?.value || ''}
        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
        className="form-control"
        disabled={item.isAutomatic}
        style={{
          ...getInputStyle(item.isAutomatic),
          ...textareaStyle,
          paddingRight: '80px',
        }}
      />
      
      {/* Size selector dropdown */}
      <select
        value={selectedSize}
        onChange={(e) => setSelectedSize(e.target.value)}
        style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          border: '1px solid #dee2e6',
          background: 'white',
          borderRadius: '4px',
          fontSize: '11px',
          padding: '4px 6px',
          cursor: 'pointer',
          color: '#495057',
        }}
      >
        {Object.entries(sizePresets).map(([key, preset]) => (
          <option key={key} value={key}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export { ResizableTextarea, SimpleResizableTextarea, PresetResizableTextarea };