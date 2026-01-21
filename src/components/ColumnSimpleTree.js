import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Badge, Box, Tooltip } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import LinkedObjectsTree from './MainComponents/LinkedObjectsTree';
import MultifileFiles from './MultifileFiles';
import FileExtText from './FileExtText';
import FileExtIcon from './FileExtIcon';
import { formatDate } from './Utils/Utils'
import CheckOutStatusBadgeIcon from './CheckoutStatusBadge';

import { FaBook } from "react-icons/fa";
import { FaFolder } from "react-icons/fa6";


const ColumnSimpleTree = ({

  data = [],
  selectedVault,
  mfilesId,
  onItemClick,
  onItemDoubleClick,
  onItemRightClick,
  onRowClick,
  getTooltipTitle,
  setBlob,
  setSelectedFileId,
  setExtension,
  setLoadingFile,
  selectedItemId,
  setSelectedItemId,
  renderHeight,
  a11yProps,
  handleTabAction,

  // Column visibility
  showNameColumn = true,
  showDateColumn = true,
  showObjectTypeName = false,
  showSizeColumn = false,
  showOwnerColumn = false,
  showStatusColumn = false,

  // Column labels
  nameColumnLabel = "Name",
  dateColumnLabel = "Date Modified",
  objectTypeNameLabel = "Object Type",
  sizeColumnLabel = "Size",
  ownerColumnLabel = "Owner",
  statusColumnLabel = "Status",

  // Font sizes
  nameColumnFontSize = 13,
  dateColumnFontSize = 12,
  objectTypeNameFontSize = 13,
  sizeColumnFontSize = 13,
  ownerColumnFontSize = 13,
  statusColumnFontSize = 13,
  headerFontSize = 13
}) => {

  // State
  const [columnWidths, setColumnWidths] = useState({
    date: 160,
    objectType: 140,
    size: 100,
    owner: 120,
    status: 100
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragColumn, setDragColumn] = useState(null);
  const [hoveredDivider, setHoveredDivider] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Refs
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  // Helper functions
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return '';
    const size = parseInt(bytes, 10);
    const units = ['B', 'KB', 'MB', 'GB'];
    const idx = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, idx)).toFixed(1)} ${units[idx]}`;
  }, []);


  const renderStatusBadge = useCallback((item) => (
    <Box sx={{
      display: 'inline-block',
      p: '2px 6px',
      borderRadius: 1,
      backgroundColor: item.checkedOut ? '#fff3cd' : '#e8f5e8',
      color: item.checkedOut ? '#856404' : '#2e7d32',
      fontSize: statusColumnFontSize
    }}>
      {item.checkedOut ? 'Locked' : 'Available'}
    </Box>
  ), [statusColumnFontSize]);

  // Column configuration
  const columns = React.useMemo(() => [
    {
      key: 'name',
      show: showNameColumn,
      label: nameColumnLabel,
      flex: true,
      align: 'left',
      fontSize: nameColumnFontSize,
      render: 'name',
      resizable: true,
    },
    {
      key: 'objectType',
      show: showObjectTypeName,
      label: objectTypeNameLabel,
      width: 'objectType',
      align: 'center',
      fontSize: objectTypeNameFontSize,
      minWidth: 80,
      maxWidth: 300,
      resizable: true,
      render: item => item.objectTypeName || 'Document'

    },
    {
      key: 'size',
      show: showSizeColumn,
      label: sizeColumnLabel,
      width: 'size',
      align: 'right',
      fontSize: sizeColumnFontSize,
      minWidth: 60,
      maxWidth: 150,
      resizable: true,
      render: item => formatFileSize(item.size)
    },
    {
      key: 'owner',
      show: showOwnerColumn,
      label: ownerColumnLabel,
      width: 'owner',
      align: 'center',
      fontSize: ownerColumnFontSize,
      minWidth: 80,
      maxWidth: 200,
      resizable: true,
      render: item => item.owner || item.createdBy || 'Unknown'
    },
    {
      key: 'status',
      show: showStatusColumn,
      label: statusColumnLabel,
      width: 'status',
      align: 'center',
      fontSize: statusColumnFontSize,
      minWidth: 70,
      maxWidth: 150,
      resizable: true,
      render: renderStatusBadge
    },
    {
      key: 'date',
      show: showDateColumn,
      label: dateColumnLabel,
      width: 'date',
      align: 'right',
      fontSize: dateColumnFontSize,
      minWidth: 80,
      maxWidth: 400,
      fontColor: '#333',
      resizable: true,
      render: item => formatDate(item.lastModifiedUtc)
    }
  ], [
    showNameColumn,
    showObjectTypeName,
    showSizeColumn,
    showOwnerColumn,
    showStatusColumn,
    showDateColumn,
    nameColumnLabel,
    objectTypeNameLabel,
    sizeColumnLabel,
    ownerColumnLabel,
    statusColumnLabel,
    dateColumnLabel,
    nameColumnFontSize,
    objectTypeNameFontSize,
    sizeColumnFontSize,
    ownerColumnFontSize,
    statusColumnFontSize,
    dateColumnFontSize,
    renderStatusBadge,
    formatFileSize
  ]);

  const visibleColumns = columns.filter(c => c.show);

  // Event handlers
  const handleMouseDown = useCallback((e, columnKey) => {
    if (e.button !== 0 || isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragColumn(columnKey);
    dragStartX.current = e.clientX;
    dragStartWidth.current = columnWidths[columnKey] || 160;
  }, [columnWidths, isMobile]);

  // Mouse move/up effects
  useEffect(() => {

    if (isMobile) return;

    let animationFrameId;

    const handleMouseMove = (e) => {
      if (!isDragging || !dragColumn) return;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStartX.current;
        const newWidth = dragStartWidth.current + deltaX;
        const col = columns.find(c => c.width === dragColumn);
        const minWidth = col?.minWidth || 80;
        const maxWidth = col?.maxWidth || 400;
        const finalWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));
        setColumnWidths(prev => ({ ...prev, [dragColumn]: finalWidth }));
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragColumn(null);
      setHoveredDivider(null);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, dragColumn, columns, isMobile]);

  // Window resize effect
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render helpers
  const renderNameColumn = (item) => {
    const classId = item.classId ?? item.classID ?? null;
    const isDocument = item.objectTypeId === 0 || item.objectID === 0;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          marginLeft: '6px'
        }}
      >
        {isDocument && item.isSingleFile ? (
          <>
            {item.isCheckedOut ? (
    
              <CheckOutStatusBadgeIcon
                color={Number(item?.checkoutuserid) === Number(mfilesId) ? "#3fa34d" : "#ef233c"}
                icon={Number(item?.checkoutuserid) === Number(mfilesId) ? "fa-check-circle" : "fa-solid fa-circle-minus"}
                offsetX="-6px"
                offsetY="-3px"
              >
                <FileExtIcon
                  fontSize={18}
                  guid={selectedVault?.guid}
                  objectId={item.id}
                  classId={classId}
                  version={item.versionId}
                />

              </CheckOutStatusBadgeIcon>


            ) : (
              <FileExtIcon
                fontSize={18}
                guid={selectedVault?.guid}
                objectId={item.id}
                classId={classId}
                version={item.versionId}
              />)}
          </>

        ) : (
          <Box sx={{ fontSize: 18, color: isDocument ? '#7cb518' : '#2a68af', display: 'flex', alignItems: 'center' }}>
            {isDocument ? (
              <FaBook size={18} color="#7cb518" />
            ) : (
              <FaFolder size={18} color="#2a68af" />
            )}
          </Box>
        )}

        <Tooltip title={getTooltipTitle?.(item) ?? item.title ?? ''} placement="right" arrow>
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0, // prevents flexbox overflow issues
            }}
          >
            {item.title}
            {item.isSingleFile && (
              <FileExtText
                guid={selectedVault?.guid}
                objectId={item.id}
                classId={classId}
                version={item.versionId}
              />
            )}
          </Box>
        </Tooltip>
      </Box>

    );
  };

  const renderColumnContent = (col, item) => {

    if (col.render === 'name') return renderNameColumn(item);
    if (typeof col.render === 'function') return col.render(item);
    return item[col.key] || '';
  };

  const getColumnStyle = (col, isLast) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
    ...(col.flex ? { flex: 1 } : { width: columnWidths[col.width] || 160, flexShrink: 0 }),
    transition: isDragging ? 'none' : 'width 200ms ease-in-out',
    pl: col.key === 'name' ? 1 : 0.5,
    pr: isLast ? 1 : 0.5,
    position: 'relative',
    height: '100%',
    fontSize: col.fontSize || headerFontSize,
    borderRight: isLast ? 'none' : '1px solid #c6c8ca'
  });

  const getDividerStyle = (idx) => {
    const nextCol = visibleColumns[idx + 1];
    const isResizable = nextCol?.resizable;
    const isActive = isDragging && dragColumn === nextCol?.width;
    const isHovered = hoveredDivider === idx && isResizable;

    return {
      width: 12,
      height: '100%',
      cursor: isResizable ? 'col-resize' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginLeft: '-6px',
      marginRight: '-6px',
      zIndex: 10,
      backgroundColor: (isActive || isHovered) ? 'rgba(28, 70, 144, 0.1)' : 'transparent',
      transition: 'background-color 150ms ease-in-out',
      '&:hover': isResizable ? {
        backgroundColor: 'rgba(28, 70, 144, 0.15)',
        '& .divider-line': { backgroundColor: '#1C4690', width: 3 }
      } : {},
      '&:active': { backgroundColor: 'rgba(28, 70, 144, 0.2)' }
    };
  };

  const renderDividerLine = (idx) => {
    const nextCol = visibleColumns[idx + 1];
    const isActive = isDragging && dragColumn === nextCol?.width;

    return (
      <Box
        className="divider-line"
        sx={{
          width: isActive ? 3 : 2,
          height: '100%',
          backgroundColor: isActive ? '#1C4690' : '#c6c8ca',
          transition: 'all 150ms ease-in-out'
        }}
      />
    );
  };

  const renderResizeHandle = (idx) => {
    const nextCol = visibleColumns[idx + 1];
    const shouldShow = nextCol?.width && (hoveredDivider === idx || (isDragging && dragColumn === nextCol?.width));

    if (!shouldShow) return null;

    return (
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 6,
        height: 16,
        backgroundColor: '#1C4690',
        borderRadius: '2px',
        opacity: 0.8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.5
      }}>
        {[...Array(3)].map((_, i) => (
          <Box key={i} sx={{ width: 1, height: 1, backgroundColor: 'white', borderRadius: '50%' }} />
        ))}
      </Box>
    );
  };

  const renderHeader = () => (

    <Box
      className="shadow-sm"
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        p: '4px 6px',
        backgroundColor: '#fff',
        fontSize: headerFontSize,
        color: '#555b6e',
        position: 'relative',
        userSelect: isDragging ? 'none' : 'auto',
        minHeight: '15px',
        borderRadius: '4px',
        marginY: '4px',
      }}
    >

      {visibleColumns.map((col, idx) => {
        const isLast = idx === visibleColumns.length - 1;

        return (
          <React.Fragment key={col.key}>
            <Box sx={getColumnStyle(col, isLast)}>
              {col.label}
            </Box>

            {!isLast && !isMobile && (
              <Box
                onMouseDown={e => {
                  const nextCol = visibleColumns[idx + 1];
                  if (nextCol?.width) handleMouseDown(e, nextCol.width);
                }}
                onMouseEnter={() => setHoveredDivider(idx)}
                onMouseLeave={() => setHoveredDivider(null)}
                sx={getDividerStyle(idx)}
              >
                {renderDividerLine(idx)}
                {renderResizeHandle(idx)}
              </Box>
            )}

          </React.Fragment>
        );
      })}
    </Box>
  );

  const renderRowCell = (col, item, idx) => {
    const isLast = idx === visibleColumns.length - 1;
    const isSelected = selectedItemId === `${item.id}-${item.title}`;

    return (
      <React.Fragment key={idx}>
        <Box
          className='p-1'
          sx={{
            ...(col.flex ? { flex: 1 } : { width: columnWidths[col.width] || 160, flexShrink: 0 }),
            backgroundColor: isSelected ? '#e5e5e5 !important' : '#fff !important',
            transition: isDragging ? 'none' : 'width 200ms ease-in-out',
            fontSize: col.fontSize || 11,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            pl: col.key === 'name' ? 1 : 0.5,
            pr: isLast ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start'
          }}
        >
          {renderColumnContent(col, item)}
        </Box>

        {!isLast && !isMobile && (
          <Box sx={{ width: 12, height: '100%', marginLeft: '-6px', marginRight: '-6px' }} />
        )}
      </React.Fragment>
    );
  };

  const renderTreeItem = (item, i) => (
    <SimpleTreeView key={i}>
      <TreeItem
        itemId={`item-${i}`}
        onClick={() => {
          console.log('Clicked item:', item);
          setSelectedItemId(`${item.id}-${item.title}`);
          onItemClick?.(item);
        }}
        onDoubleClick={() => onItemDoubleClick?.(item)}

        sx={{
          "& .MuiTreeItem-content": { backgroundColor: '#fff !important' },
          "& .MuiTreeItem-content:hover": { backgroundColor: '#fff !important' }
        }}
        label={
          <Box onContextMenu={e => {
            e.preventDefault();
            onItemRightClick?.(e, item);
            console.log('Right-clicked item:', item);
          }} sx={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: 20 }}>
            {visibleColumns.map((col, idx) => renderRowCell(col, item, idx))}
          </Box>
        }
      >
        {!item.isSingleFile && (
          <MultifileFiles
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
            item={item}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            selectedVault={selectedVault}
            setBlob={setBlob}
            setSelectedFileId={setSelectedFileId}
            setExtension={setExtension}
            setLoadingFile={setLoadingFile}
            a11yProps={a11yProps}
            fontSize={18}
            mfilesId={mfilesId}
            handleTabAction={handleTabAction}
          />
        )}
        <LinkedObjectsTree
          id={item.id}
          classId={item.classId || item.classID}
          objectType={item.objectTypeId || item.objectID}
          selectedVault={selectedVault}
          mfilesId={mfilesId}
          handleRowClick={onRowClick}
          onItemRightClick={onItemRightClick}
          setSelectedItemId={setSelectedItemId}
          selectedItemId={selectedItemId}

        />
      </TreeItem>
    </SimpleTreeView>
  );

  return (
    <Box>
      {renderHeader()}

      <Box
        sx={{
          height: renderHeight ? renderHeight : '55vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          color: '#333',
          marginLeft: '10px',
        }}
      >

        {data.map(renderTreeItem)}
      </Box>

      {isDragging && !isMobile && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'col-resize',
          zIndex: 9999,
          pointerEvents: 'none',
          backgroundColor: 'transparent'
        }} />
      )}
    </Box>
  );
};

export default ColumnSimpleTree;