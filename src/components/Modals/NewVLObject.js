import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';


const NewVLObjectDialog = (props) => {
  return (
    <Dialog open={props.isFormOpen} maxWidth="xl">
      <DialogTitle
        className="p-2 d-flex justify-content-between align-items-center"
        style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
      >
        <img className="mx-3" src={props.logo} alt="Logo" width="180px" />
        <span className="ml-auto mx-3">
          {props.selectedObjectId === 0 ? (
            <i style={{ color: '#fff', fontSize: '20px' }} className="fa-solid fa-file-circle-plus" />
          ) : (
            <i style={{ color: '#fff', fontSize: '20px' }} className="fas fa-folder-plus" />
          )}
          <small className="mx-2">Create {props.selectedClassName}</small>
        </span>
      </DialogTitle>

      <DialogContent className="form-group my-3" sx={{ overflow: 'auto' }}>
        {props.selectedObjectId === 0 && !props.templateIsTrue ? (
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              md={7}
              order={{ xs: 1, md: 2 }}
              sx={{ padding: '20px', width: '250px', maxHeight: '310px', overflowY: 'auto' }}
            >
              <props.PropertiesList
                properties={props.filteredProperties}
                formValues={props.formValues}
                formErrors={props.formErrors}
                selectedClassName={props.selectedClassName}
                selectedTemplate={props.selectedTemplate}
                selectedVault={props.selectedVault}
                templateIsTrue={props.templateIsTrue}
                onInputChange={props.handleInputChange}
                mfilesId={props.mfilesId}
                handleClassSelection={props.handleClassSelection}
                fetchItemData={props.fetchItemData}
                setAddingValueListItem={props.setAddingValueListItem}
              />
            </Grid>

            <Grid item xs={12} md={5} order={{ xs: 2, md: 2 }} sx={{ width: '700px' }}>
              <props.FileUploadComponent handleFileChange={props.handleFileChange} uploadedFile={props.uploadedFile} />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} sx={{ width: '650px' }}>
              <props.PropertiesList
                properties={props.filteredProperties}
                formValues={props.formValues}
                formErrors={props.formErrors}
                selectedClassName={props.selectedClassName}
                selectedTemplate={props.selectedTemplate}
                selectedVault={props.selectedVault}
                templateIsTrue={props.templateIsTrue}
                onInputChange={props.handleInputChange}
                mfilesId={props.mfilesId}
                handleClassSelection={props.handleClassSelection}
                fetchItemData={props.fetchItemData}
                setAddingValueListItem={props.setAddingValueListItem}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions
        style={{
          backgroundColor: '#ecf4fc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px',
          gap: '16px',
        }}
      >
        {/* Left Side - Template Section */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: '40px',
          }}
        >
          {props.templateIsTrue ? (
            <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
              <a
                href="#"
                style={{ color: '#2757aa', textDecoration: 'none', fontSize: '14.5px' }}
                onClick={(e) => {
                  e.preventDefault();
                  props.dontUseTemplates();
                }}
              >
                <i className="fa-solid fa-upload mx-1"></i> Switch to File Upload Or Switch Template
              </a>
            </Typography>
          ) : (
            props.templates &&
            props.templates.length > 0 && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#2757aa',
                    fontWeight: 600,
                    fontSize: '12px',
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <i className="fa-solid fa-copy mx-1" style={{ fontSize: '11px' }}></i> Quick Templates
                </Typography>
                <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <props.TemplateActions
                    templateIsTrue={props.templateIsTrue}
                    templates={props.templates}
                    selectedVault={props.selectedVault}
                    onUseTemplate={props.UseTemplate}
                    onDontUseTemplates={props.dontUseTemplates}
                  />
                </Box>
              </>
            )
          )}
        </Box>

        {/* Right Side - Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          <Button
            sx={{ textTransform: 'none' }}
            className="rounded-pill"
            color="warning"
            size="medium"
            variant="contained"
            onClick={() => {
              props.closeFormDialog();
              props.setTemplateIsTrue(false);
              props.setUploadedFile(null);
            }}
            disabled={props.miniLoader}
          >
            Cancel
          </Button>
          <Button
            sx={{ textTransform: 'none', position: 'relative' }}
            className="rounded-pill"
            color="primary"
            size="medium"
            variant="contained"
            onClick={props.handleSubmit}
            disabled={props.miniLoader}
          >
            {props.miniLoader ? (
              <>
                Submitting Please wait ...{' '}
                <CircularProgress size={24} color="inherit" sx={{ ml: 1 }} />
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NewVLObjectDialog;
