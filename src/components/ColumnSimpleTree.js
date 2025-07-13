import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Tooltip } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import LinkedObjectsTree from './MainComponents/LinkedObjectsTree';
import MultifileFiles from './MultifileFiles';
import FileExtText from './FileExtText';
import FileExtIcon from './FileExtIcon';

const ColumnSimpleTree = ({
  data = [],
  selectedVault,
  mfilesId,
  onItemClick,
  onItemDoubleClick,
  onItemRightClick,
  onRowClick,
  downloadFile,
  getTooltipTitle,
  selectedItemId,
  setSelectedItemId,
 
  showNameColumn = true,
  showDateColumn = true,
  showObjectTypeName = false,
  showSizeColumn = false,
  showOwnerColumn = false,
  showStatusColumn = false,

  nameColumnLabel = "Name",
  dateColumnLabel = "Date Modified",
  objectTypeNameLabel = "Object Type",
  sizeColumnLabel = "Size",
  ownerColumnLabel = "Owner",
  statusColumnLabel = "Status",

  // Font size customization for each column
  nameColumnFontSize = 12.5,
  dateColumnFontSize = 12,
  objectTypeNameFontSize = 12,
  sizeColumnFontSize = 12,
  ownerColumnFontSize = 12,
  statusColumnFontSize = 11,
  headerFontSize = 12
}) => {

 

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
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const columns = [
    { key: 'name',   show: showNameColumn,     label: nameColumnLabel,       flex: true,  align: 'left',   fontSize: nameColumnFontSize,   render: 'name' },
    { key: 'objectType', show: showObjectTypeName, label: objectTypeNameLabel, width: 'objectType', align: 'center', fontSize: objectTypeNameFontSize, minWidth: 80,  maxWidth: 300, render: item => item.objectTypeName || 'Document' },
    { key: 'size',   show: showSizeColumn,     label: sizeColumnLabel,       width: 'size', align: 'right',  fontSize: sizeColumnFontSize,   minWidth: 60,   maxWidth: 150, render: item => {
        if (!item.size) return '';
        const bytes = parseInt(item.size, 10);
        const units = ['B','KB','MB','GB'];
        const idx = Math.floor(Math.log(bytes)/Math.log(1024));
        return `${(bytes/Math.pow(1024,idx)).toFixed(1)} ${units[idx]}`;
      }
    },
    { key: 'owner',  show: showOwnerColumn,    label: ownerColumnLabel,      width: 'owner', align: 'center', fontSize: ownerColumnFontSize,  minWidth: 80,  maxWidth: 200, render: item => item.owner || item.createdBy || 'Unknown' },
    { key: 'status', show: showStatusColumn,   label: statusColumnLabel,     width: 'status', align: 'center', fontSize: statusColumnFontSize, minWidth: 70,  maxWidth: 150, render: item => (
        <Box sx={{
          display: 'inline-block',
          p: '2px 6px',
          borderRadius: 1,
          backgroundColor: item.checkedOut ? '#fff3cd':'#e8f5e8',
          color: item.checkedOut ? '#856404':'#2e7d32',
          fontSize: statusColumnFontSize
        }}>
          {item.checkedOut ? '🔒 Locked':'✅ Available'}
        </Box>
      )
    },
    { key: 'date',  show: showDateColumn,     label: dateColumnLabel,      width: 'date', align: 'right', fontSize: dateColumnFontSize,   minWidth: 80,   maxWidth: 400, render: item => {
        if (!item.lastModifiedUtc) return '';
        const d = new Date(item.lastModifiedUtc);
        if (isNaN(d)) return '';
        return d.toLocaleString('en-US',{
          year:'numeric',month:'numeric',day:'numeric',
          hour:'2-digit',minute:'2-digit',hour12:true
        }).replace(',','');
      }
    }
  ];

  const visibleColumns = columns.filter(c => c.show);

  const handleMouseDown = useCallback((e, columnKey) => {
    if (e.button !== 0 || isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragColumn(columnKey);
    dragStartX.current = e.clientX;
    dragStartWidth.current = columnWidths[columnKey] || 160;
  }, [columnWidths, isMobile]);

  useEffect(() => {
    if (isMobile) return;

    let animationFrameId;

    const handleMouseMove = (e) => {
      if (!isDragging || !dragColumn) return;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStartX.current;
        const newW = dragStartWidth.current + deltaX;
        const col = columns.find(c => c.width === dragColumn);
        const minW = col?.minWidth || 80;
        const maxW = col?.maxWidth || 400;
        const w = Math.min(maxW, Math.max(minW, newW));
        setColumnWidths(prev => ({ ...prev, [dragColumn]: w }));
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderColumnContent = (col,item) => {
    if (col.render === 'name') {
      return (
        <Box sx={{display:'flex',alignItems:'center',gap:1,width:'100%'}}>
          {(item.objectTypeId===0||item.objectID===0)&&item.isSingleFile ? (
            <FileExtIcon fontSize="15px" guid={selectedVault?.guid} objectId={item.id} classId={item.classId||item.classID}/>
          ):(
            <i className={(item.objectTypeId===0||item.objectID===0)?'fas fa-book':'fa-solid fa-folder'}
               style={{fontSize:15,color:(item.objectTypeId===0||item.objectID===0)?'#7cb518':'#2a68af'}}/>
          )}
          <Tooltip title={getTooltipTitle?.(item)||item.title||''} placement="top" arrow>
            <Box sx={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>
              {item.title}  
              {item.isSingleFile && <FileExtText guid={selectedVault?.guid} objectId={item.id} classId={item.classId||item.classID}/>}
            </Box>
          </Tooltip>
        </Box>
      );
    }
    if (typeof col.render==='function') return col.render(item);
    return item[col.key]||'';
  };

  return (
    <Box>


      {/* Column Headers */}
      <Box sx={{
        display:'flex',alignItems:'stretch',p:'4px 5px',
        backgroundColor:'#f8f9fa',borderBottom:'1px solid #dee2e6',
        fontSize: headerFontSize, color:'#495057',position:'relative',
        userSelect: isDragging ? 'none' : 'auto',
        minHeight: 30,
       
       
       
      }}>
        {visibleColumns.map((col, idx) => {
          const isLast = idx === visibleColumns.length - 1;
          return (
            <React.Fragment key={col.key}>
              <Box
                sx={{
                  display:'flex',alignItems:'center',
                  justifyContent:
                    col.align==='center'? 'center' :
                    col.align==='right'?  'flex-end':'flex-start',
                  ...(col.flex
                    ? { flex:1 }
                    : { width: columnWidths[col.width]||160, flexShrink: 0 }
                  ),
                  transition: isDragging ? 'none' : 'width 200ms ease-in-out',
                  pl: col.key==='name'?1:0.5,
                  pr: isLast ? 1 : 0.5,
                  position: 'relative',
                  height: '100%',
                 
                  fontSize: col.fontSize || headerFontSize,
                  borderRight: isLast ? 'none' : '1px solid #c6c8ca'
                }}
              >
                {col.label}
              </Box>
              
              {/* Draggable Column Divider */}
              {!isLast && !isMobile && (
                <Box
                  onMouseDown={e => {
                    const nextCol = visibleColumns[idx + 1];
                    // Only allow dragging if the next column is resizable (has width property)
                    if (nextCol && nextCol.width) {
                      handleMouseDown(e, nextCol.width);
                    }
                  }}
                  onMouseEnter={() => setHoveredDivider(idx)}
                  onMouseLeave={() => setHoveredDivider(null)}
                  sx={{
                    width: 12,
                    height: '100%',
                    cursor: visibleColumns[idx + 1]?.width ? 'col-resize' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginLeft: '-6px',
                    marginRight: '-6px',
                    zIndex: 10,
                    backgroundColor: 
                      (isDragging && dragColumn === visibleColumns[idx + 1]?.width) || 
                      (hoveredDivider === idx && visibleColumns[idx + 1]?.width)
                        ? 'rgba(28, 70, 144, 0.1)' 
                        : 'transparent',
                    transition: 'background-color 150ms ease-in-out',
                    '&:hover': visibleColumns[idx + 1]?.width ? {
                      backgroundColor: 'rgba(28, 70, 144, 0.15)',
                      '& .divider-line': {
                        backgroundColor: '#1C4690',
                        width: 3
                      }
                    } : {},
                    '&:active': {
                      backgroundColor: 'rgba(28, 70, 144, 0.2)'
                    }
                  }}
                >
                  {/* Divider Line - Always Visible */}
                  <Box 
                    className="divider-line"
                    sx={{
                      width: 
                        (isDragging && dragColumn === visibleColumns[idx + 1]?.width) ? 3 : 2,
                      height: '100%',
                      backgroundColor: 
                        (isDragging && dragColumn === visibleColumns[idx + 1]?.width) 
                          ? '#1C4690' 
                          : '#c6c8ca',
                      transition: 'all 150ms ease-in-out'
                    }} 
                  />
                  
                  {/* Resize Handle Indicator - Only show for resizable columns */}
                  {visibleColumns[idx + 1]?.width && (hoveredDivider === idx || (isDragging && dragColumn === visibleColumns[idx + 1]?.width)) && (
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
                      <Box sx={{ width: 1, height: 1, backgroundColor: 'white', borderRadius: '50%' }} />
                      <Box sx={{ width: 1, height: 1, backgroundColor: 'white', borderRadius: '50%' }} />
                      <Box sx={{ width: 1, height: 1, backgroundColor: 'white', borderRadius: '50%' }} />
                    </Box>
                  )}
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Rows */}
      <Box sx={{ height:'60vh', overflowY:'auto', overflowX:'hidden', color:'#333', marginLeft: '10px' }}>
        {data.map((item,i)=>(
          <SimpleTreeView key={i}>
            <TreeItem
              itemId={`item-${i}`}
              onClick={()=>{ setSelectedItemId(`${item.id}-${item.title}`); onItemClick?.(item); }}
              onDoubleClick={()=>onItemDoubleClick?.(item)}
              onContextMenu={e=>{e.preventDefault();onItemRightClick?.(e,item);}}
              sx={{
                "& .MuiTreeItem-content":{ backgroundColor:'#fff !important' },
                "& .MuiTreeItem-content:hover":{ backgroundColor:'#f9f9f9 !important' }
              }}
              label={
                <Box sx={{display:'flex',alignItems:'center',width:'100%', minHeight: 24}}>
                  {visibleColumns.map((col,ci)=>{
                    const isLast = ci === visibleColumns.length - 1;
                    const isSelected = selectedItemId === `${item.id}-${item.title}`;

                    return (
                      <React.Fragment key={ci}>
                        <Box
                          className='p-1'
                          sx={{
                            ...(col.flex
                              ? { flex:1 }
                              : { width:columnWidths[col.width]||160, flexShrink:0 }
                            ),
                            backgroundColor: isSelected ? '#fcf3c0 !important' : '#fff !important' ,
                            transition: isDragging ? 'none' : 'width 200ms ease-in-out',
                            fontSize: col.fontSize || 13,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                            pl: col.key==='name'?1:0.5,
                            pr: isLast ? 1 : 0.5,
                          
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: col.align==='center'? 'center' : col.align==='right'? 'flex-end':'flex-start'
                          }}
                        >
                          {renderColumnContent(col,item)}
                        </Box>
                        
                        {/* Transparent spacer to maintain alignment with header dividers */}
                        {!isLast && !isMobile && (
                          <Box sx={{
                            width: 12,
                            height: '100%',
                            marginLeft: '-6px',
                            marginRight: '-6px',
                            // Transparent spacer - no visual divider
                          }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </Box>
              }
            >
              {!item.isSingleFile && (
                <MultifileFiles
                  item={item}
                  downloadFile={downloadFile}
                  selectedItemId={selectedItemId}
                  setSelectedItemId={setSelectedItemId}
                  selectedVault={selectedVault}
                />
              )}
              <LinkedObjectsTree
                id={item.id}
                classId={item.classId||item.classID}
                objectType={item.objectTypeId||item.objectID}
                selectedVault={selectedVault}
                mfilesId={mfilesId}
                handleRowClick={onRowClick}
                setSelectedItemId={setSelectedItemId}
                selectedItemId={selectedItemId}
                downloadFile={downloadFile}
              />
            </TreeItem>
          </SimpleTreeView>
        ))}
      </Box>
      
      {/* Global drag overlay */}
      {isDragging && !isMobile && (
        <Box sx={{
          position:'fixed',top:0,left:0,right:0,bottom:0,
          cursor:'col-resize',zIndex:9999,pointerEvents:'none',
          backgroundColor: 'transparent'
        }} />
      )}
    </Box>
  );
};

export default ColumnSimpleTree;