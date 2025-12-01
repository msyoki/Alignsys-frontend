import React, { useState } from 'react'; 
import { Box, Tooltip, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const SimpleIconTable = ({
  data = [],
  onItemClick,
  onItemDoubleClick,
  onItemRightClick,
  getTooltipTitle,
  renderHeight = '100%',
  fetchPreviewData,
  getIcon
}) => {
  const [selectedItemId, setSelectedItemId] = useState(null);



  const getDisplayTitle = (item) => ({
    name: item?.title
      ? `${item.title}${item.extension ? `.${item.extension}` : ''}`
      : 'Untitled',
    lastModifiedUtc: item?.lastModifiedUtc || '-',
    version: item?.versionid || '-',
    lastModifiedBy: item?.lastModifiedBy || '-',
  });

  const getTooltip = (item) => {
    const workflow = item.objectprops?.find((p) => p.propName === 'Workflow')?.value;
    const state = item.objectprops?.find((p) => p.propName === 'State')?.value;
    return getTooltipTitle?.(item) ?? `${workflow ?? 'No Workflow'} - ${state ?? 'No State'}`;
  };

  const handleRowClick = (item, index) => {
    const id = item.id ?? item.versionid ?? index; // unique row id
    setSelectedItemId(id);
    onItemClick?.(item);
    fetchPreviewData?.();
  };

  return (
    <Box
      sx={{
        height: renderHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#fff',
        borderRadius: 1,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8f8f8' }}>
            <TableCell sx={{ fontWeight: 600, fontSize: '12px', py: 0.5, width: '40%', maxWidth: 200 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '12px', py: 0.5, width: '10%', maxWidth: 60, whiteSpace: 'nowrap' }}>Version</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '12px', py: 0.5, width: '25%', maxWidth: 120, whiteSpace: 'nowrap' }}>StatusTime</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '12px', py: 0.5, width: '25%', maxWidth: 120, whiteSpace: 'nowrap' }}>ModifiedBy</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((item, i) => {
            const { name, version, lastModifiedUtc, lastModifiedBy } = getDisplayTitle(item);
            const id = item.id ?? item.versionid ?? i;
            const isSelected = selectedItemId === id;
            const extension = item.extension || item.objectFiles?.[0]?.extension || item.fileExtension || '';

            return (
              <TableRow
                key={id}
                onClick={() => handleRowClick(item, i)}
                onDoubleClick={() => onItemDoubleClick?.(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onItemRightClick?.(e, item);
                }}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#e5e5e5' : '#fff',
                  '&:hover': { backgroundColor: isSelected ? '#e5e5e5' : '#f6f6f6' },
                }}
              >
                <TableCell sx={{ fontSize: '12.8px', py: 0.4, width: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Tooltip title={getTooltip(item)} placement="right" arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      {getIcon(extension, 16)}
                      <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </Box>
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontSize: '12.8px', py: 0.4, width: '10%', whiteSpace: 'nowrap' }}>{version}</TableCell>
                <TableCell sx={{ fontSize: '12.8px', py: 0.4, width: '25%', whiteSpace: 'nowrap' }}>{lastModifiedUtc}</TableCell>
                <TableCell sx={{ fontSize: '12.8px', py: 0.4, width: '25%', whiteSpace: 'nowrap' }}>{lastModifiedBy}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default SimpleIconTable;
