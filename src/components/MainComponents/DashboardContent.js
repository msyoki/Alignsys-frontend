import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Avatar, Box, Tabs, Tab, Typography, Tooltip, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { BiHomeAlt2 } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { CiCircleList } from "react-icons/ci";
import { FaArrowsSpin } from "react-icons/fa6";
import { TbArrowMerge } from "react-icons/tb";
import { FiCheckSquare } from "react-icons/fi";
import { FaHistory } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import { FaBan } from "react-icons/fa";


// Components
import Loader from '../Loaders/LoaderMini';
import ObjectData from './ObjectData';
import RightClickMenu from '../RightMenu';
import ViewsList from './ViewsList';
import VaultSelectForm from '../SelectVault';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';
import ConfirmUpdateDialog from '../Modals/ConfirmUpdateObjectDialog';
import TimedAlert from '../TimedAlert';
import OfficeApp from '../Modals/OfficeAppDialog';
import AddButtonWithMenu from '../AddButtonWithMenu';
import ColumnSimpleTree from '../ColumnSimpleTree';

// Constants and assets
import * as constants from '../Auth/configs';

import logo from '../../images/ZFBLU.png';
import PdfConversionDialog from '../Modals/PdfConversionDialog';
import PdfMergeDialog from '../Modals/PdfMergeDialog';
import ChartGenerator from '../Reports/ChartGenerator';
import UserAvatarMenu from '../UserAvatar';
import History from '../Modals/History';
import { THEME_COLORS } from '../../constants/themeColors';
import { THEME_CONFIG } from '../../config/theme.config';




// Custom Hooks
function useSessionState(key, defaultValue) {
  const getInitialValue = () => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === null || stored === 'undefined') {
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  };

  const [value, setValue] = useState(getInitialValue);

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }, [key, value]);

  return [value, setValue];
}

// Tab Panel Component
function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className='my-1' sx={{ height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {

  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function a11yProps2(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}




const DashboardContent = (props) => {


  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0]),
      });

      props.setDroppedFile(uploadedFile);

      // Ensure fetchItemData is called
      if (uploadedFile) {
        await props.fetchItemData(0, "Document");
      }

      // Optional alert
      // alert(`File uploaded: ${uploadedFile.name}`);
    }
  }, [props]); // include props if necessary



  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // single file only
    noClick: true,   // disables click to open file dialog
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.ms-powerpoint': [],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': [],
    },


  });



  const removeFile = () => {
    if (file && file.preview) URL.revokeObjectURL(file.preview);
    props.setDroppedFile(null);
  };


  const [classUpdatePayload, setClassUpdatePayload] = useState('ss_classUpdatePayload', {});
  const [changedClass, setChangedClass] = useState('ss_changedClass', false);

  // Session state
  const [value, setValue] = useSessionState('ss_value', 0);
  const [selectedObject, setSelectedObject] = useSessionState('ss_selectedObject', {});
  const [selectedFileId, setSelectedFileId] = useSessionState('ss_selectedFileId', null);
  const [selectedViewObjects, setSelectedViewObjects] = useSessionState('ss_selectedViewObjects', []);
  const [viewNavigation, setViewNavigation] = useSessionState('ss_viewNavigation', []);
  const [viewNavigation2, setViewNavigation2] = useSessionState('ss_viewNavigation2', []);
  const [previewObjectProps, setPreviewObjectProps] = useSessionState('ss_previewObjectProps', []);
  const [formValues, setFormValues] = useSessionState('ss_formValues', {});
  const [base64, setBase64] = useSessionState('ss_base64', '');
  const [extension, setExtension] = useSessionState('ss_extension', '');
  const [dialogOpen, setDialogOpen] = useSessionState('ss_dialogOpen', false);
  const [updatingObject, setUpdatingObject] = useSessionState('ss_updatingObject', false);
  const [selectedObjWf, setSelectedObjWf] = useSessionState('ss_selectedObjWf', {});
  const [currentState, setCurrentState] = useSessionState('ss_currentState', {});
  const [selectedState, setSelectedState] = useSessionState('ss_selectedState', {});
  const [comments, setComments] = useSessionState('ss_comments', []);
  const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
  const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
  const [searched, setSearched] = useSessionState('ss_searched', false);
  const [previewWindowWidth, setPreviewWindowWidth] = useSessionState('ss_previewWindowWidth', 40);
  const [workflows, setWorkflows] = useSessionState('ss_vaultWorkflows', []);

  // Local state
  const [loading, setLoading] = useState(false);
  const [loadingobjects, setLoadingObjects] = useState(false);
  const [loadingPreviewObject, setLoadingPreviewObject] = useState(false);
  const [loadingfile, setLoadingFile] = useState(false);
  const [loadingobject, setLoadingObject] = useState(false);
  const [loadingcomments, setLoadingComments] = useState(false);
  const [loadingClick, setLoadingClick] = useState(false);
  const [newWFState, setNewWFState] = useState(null);
  const [newWF, setNewWF] = useState(null);
  const [approvalPayload, setApprovalPayload] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [loadingWFS, setLoadingWFS] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [alertOpen, setAlertPopOpen] = useState(false);
  const [severity, setAlertPopSeverity] = useState("success");
  const [message, setAlertPopMessage] = useState("This is a success message!");
  const [file, setFile] = useState(null);
  const [blob, setBlob] = useState(null);
  const [blobReport, setBlobReport] = useState(null);

  // Layout and interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  const [pdfDialogOpen, setPdfDialogOpen] = useSessionState('ss_pdfDialogOpen', false);
  const [pdfConversionItem, setPdfConversionItem] = useSessionState('ss_pdfConversionItem', null);
  const [pdfOverwriteOriginal, setPdfOverwriteOriginal] = useSessionState('ss_pdfOverwriteOriginal', false);
  const [isConvertingToPdf, setIsConvertingToPdf] = useSessionState('ss_isConvertingToPdf', false);


  const [mergeDialogOpen, setMergeDialogOpen] = useSessionState('ss_mergeDialogOpen', false);
  const [mergeItem, setMergeItem] = useSessionState('ss_mergeItem', null);
  const [isMergingToPdf, setIsMergingToPdf] = useSessionState('ss_isMergeToPdf', false);

  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');

  const [openHistory, setOpenHistory] = useState(false)
  const [isFile, setIsFile] = useState(false)

  const [objectHistory, setObjectHistory] = useState([])
  const [loadingHisytory, setLoadingHistory] = useState(false)


  const [refreshKey, setRefreshKey] = useState(0);

  const reloadViews = () => {
    setRefreshKey(prev => prev + 1); // trigger a reload
  };

  const handleTabAction = () => {
    // Delay everything inside by 5 seconds
    setTimeout(() => {
      if (selectedTab) {
        switch (selectedTab) {
          case 'Recent':
            props.getRecent?.();
            break;
          case 'Assigned':
            props.getAssigned?.();
            break;
          case 'Deleted':
            props.getDeleted?.();
            break;
          default:
            reloadViews();
            break;
        }
      }

      if (props.searchTerm?.length > 0 && props.data?.length > 0) {
        props.searchObject(props.searchTerm, props.selectedVault.guid).then((data) => {
          setLoading(false);
          setSearched(true);
          props.setData(data);
        });
      }
    }, 2500); // ⏱ 5 seconds
  };





  // Refs
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const containerRef = useRef(null);

  // Click handling
  let clickTimeout = null;

  const convertToPDF = async (item, overWriteOriginal) => {
    const payload = {
      vaultGuid: props.selectedVault.guid,
      objectId: item.id,
      classId: item.classID || item.classId,
      fileID: file.fileID,
      overWriteOriginal: overWriteOriginal,
      separateFile: !overWriteOriginal,
      userID: props.selectedVault?.vaultId
    };

    try {
      setIsConvertingToPdf(true);

      await axios.post(
        `${constants.mfiles_api}/api/objectinstance/ConvertToPdf`,
        payload,
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );
      handleTabAction()

      // Show success message
      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Document successfully converted to PDF!");

    } catch (error) {
      console.error('Error converting to PDF:', error);

      // Show error message
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      const rawMessage = error?.response?.data;
      const userMessage = typeof rawMessage === 'string'
        ? rawMessage.split('\n')[0].trim()
        : 'Failed to convert file to PDF';
      setAlertPopMessage(userMessage);


    } finally {
      setIsConvertingToPdf(false);
      setPdfDialogOpen(false);
      setPdfConversionItem(null);
    }
  };


  // 4. Add helper functions to handle the dialog
  const handleMergeRequest = (item) => {
    setMergeItem(item);
    setMergeDialogOpen(true);
  };

  const handleMergeConfirm = async () => {
    setIsMergingToPdf(true);

    // console.log("Merge item:", mergeItem);
    if (mergeItem) {
      // Prepare payload
      const payload = {
        vaultGuid: props.selectedVault.guid,
        userID: props.selectedVault?.vaultId,
        oldClassID: mergeItem.classID ?? mergeItem.classId,
        oldObjectTypeID: mergeItem.objectID ?? mergeItem.objectTypeId,
        objectId: mergeItem.id,
        title: mergeItem.title,
      };

      // Log payload before sending
      // console.log("Payload to be sent:", payload);

      try {
        const response = await axios.post(
          `${constants.mfiles_api}/api/objectinstance/CombinePdfObjectFiles`,
          payload,
          {
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
          }
        );

        // console.log("Response:", response.data);

        handleTabAction();

      } catch (error) {
        console.error("Error combining PDF object files:", error);

      } finally {
        setIsMergingToPdf(false);
        setMergeDialogOpen(false);
        setMergeItem(null);
      }
    }

    handleTabAction()


  };

  const handlMergeCancel = () => {
    setMergeDialogOpen(false);
    setMergeItem(null);
    setIsMergingToPdf(false);
  };

  const handlePdfConversionRequest = (item, overwriteOriginal) => {
    setPdfConversionItem(item);
    setPdfOverwriteOriginal(overwriteOriginal);
    setPdfDialogOpen(true);
  };


  const handlePdfConversionConfirm = () => {
    handleTabAction()
    if (pdfConversionItem) {
      convertToPDF(pdfConversionItem, pdfOverwriteOriginal);
    }
  };

  const handlePdfConversionCancel = () => {
    setPdfDialogOpen(false);
    setPdfConversionItem(null);
    setIsConvertingToPdf(false);
  };

  const fetchObjectFile = async (item) => {
    const classId = item.classId ?? item.classID;
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${classId}`;

    try {
      const response = await axios.get(url, {
        headers: { Accept: '*/*' }
      });
      const file = response.data?.[0];
      setFile(file);
    } catch (error) {
      console.error('Failed to fetch object file:', error);
    }
  };

  const fetchObjectProperties = async (item) => {
    const classId = item.classId !== undefined ? item.classId : item.classID;
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${classId}/${props.selectedVault?.vaultId}`;

    try {
      const response = await axios.get(url);
      setPreviewObjectProps(response.data);
      console.log(response.data)
      return response.data;
    } catch (error) {

      setAlertPopOpen(true);
      setAlertPopSeverity("info");
      setAlertPopMessage("Object metadata could not be retrieved, Object was deleted.");
      console.error('Error fetching object properties:', error);
      throw error;
    }
  };

  const handleDocumentDownload = async (item) => {
    setLoadingFile(true);

    try {
      // Get file metadata
      const filesUrl = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
      const filesResult = await axios.get(filesUrl, {
        headers: { Accept: '*/*' },
        timeout: 0
      });
      // console.log(filesResult)

      const fileData = filesResult.data;
      const fileId = fileData?.[0]?.fileID;
      const documentGuid = fileData?.[0]?.reportGuid ?? null;
      // console.log(documentGuid)
      if (documentGuid) {
        try {
          const blobReportResult = await axios.post(
            `${constants.dss_url}/api/Doc/RetrieveFile`,
            { fullfilename: `${documentGuid}_Report.pdf` },
            {
              headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
              },
              responseType: 'blob',
              timeout: 0,
            }
          );

          const blobReportData = blobReportResult.data;
          if (!(blobReportData instanceof Blob)) {
            throw new Error('Invalid file format received');
          }

          setBlobReport(blobReportData);
        } catch (error) {
          console.error('Error fetching report file:', error);
        }
      }


      if (!fileId) throw new Error('No file ID found in response');

      setSelectedFileId(fileId);

      // Download blob
      const classId = item.classId ?? item.classID;
      const downloadUrlBlob = `${constants.mfiles_api}/api/objectinstance/DownloadOtherFiles?ObjectId=${item.id}&VaultGuid=${props.selectedVault.guid}&fileID=${fileId}&ClassId=${classId}`;
      // console.log(downloadUrlBlob)
      const blobResult = await axios.get(downloadUrlBlob, {
        headers: { Accept: '*/*' },
        responseType: 'blob',
        timeout: 0
      });


      const blobData = blobResult.data;
      if (!(blobData instanceof Blob)) throw new Error('Invalid file format received');

      setBlob(blobData);






      // Set file extension
      const extension = fileData[0]?.extension?.replace('.', '') || '';
      setExtension(extension);
      console.log("File downloaded successfully")


      return { blob: blobData, extension, fileId, success: true };
    } catch (error) {
      console.error('Document download error:', error);
      setBase64('');
      setBlob(null);
      setBlobReport(null);
      setExtension('');
      console.log('Document download error:', error);
      // throw new Error(`Download failed: ${error.message}`);

    } finally {
      setLoadingFile(false);
    }
  };

  const getObjectComments = async (item) => {
    setLoadingComments(true);
    const url = `${constants.mfiles_api}/api/Comments?ObjectId=${item.id}&VaultGuid=${props.selectedVault.guid}&ObjectTypeId=${(item.objectID ?? item.objectTypeId)}`;

    try {
      const response = await axios.get(url, {
        headers: { 'accept': '*/*' }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchVaultWorkflows = async (objectTypeId, classId) => {
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/WorkflowsInstance/GetVaultsObjectClassTypeWorkflows/${props.selectedVault.guid}/${props.selectedVault?.vaultId}/${objectTypeId}/${classId}`,
        { headers: { 'accept': '*/*' } }
      );
      setWorkflows(response.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoadingWFS(false);
    }
  };

  const getSelectedObjWorkflow = async (objectTypeId, objectsId, classId) => {
    const data = {
      vaultGuid: props.selectedVault.guid,
      objectTypeId: objectTypeId,
      objectId: objectsId,
      userEmail: props.user.email,
      userID: props.selectedVault?.vaultId
    };

    try {
      const response = await axios.post(
        `${constants.mfiles_api}/api/WorkflowsInstance/GetObjectworkflowstate`,
        data,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response.data)
      setSelectedObjWf(response.data);
      setCurrentState({
        title: response.data.currentStateTitle,
        id: response.data.currentStateid
      });
    } catch (error) {
      fetchVaultWorkflows(objectTypeId, classId);
      setSelectedObjWf(null);
      console.error('Workflow fetch error:', error);
    } finally {
      setLoadingWFS(false);
    }
  };

  // Helper functions
  const resetPreviewState = () => {
    setWorkflows([]);
    setCheckedItems({});
    setNewWF(null);
    setNewWFState(null);
    setLoadingWFS(true);
    setComments([]);
    setSelectedState({});
    setFormValues({});
  };

  const setLoadingStates = (loading) => {
    setLoadingObject(loading);
    setLoadingClick(loading);
  };

  // Main preview functions
  const previewObjectInternal = async (item, isDocument) => {
    console.log(selectedObject)
    console.log(props.user)
    resetPreviewState();
    setLoadingStates(true);
    setSelectedObject(item);
    setBase64('');
    setBlob(null);
    setBlobReport(null);
    setExtension('');

    // Get workflow info
    const objectTypeId = item.objectTypeId !== undefined ? item.objectTypeId : item.objectID;
    const classId = item.classId !== undefined ? item.classId : item.classID;
    getSelectedObjWorkflow(objectTypeId, item.id, classId);

    try {
      const promises = [];

      // Always fetch object properties
      promises.push(fetchObjectProperties(item));

      // Add document download if needed
      if (isDocument) {
        promises.push(handleDocumentDownload(item));
      }

      // Add comments fetch
      promises.push(getObjectComments(item));

      const results = await Promise.allSettled(promises);

      // Handle any rejected promises
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Promise ${index} rejected:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Unexpected error in preview operation:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const previewObject = async (item) => {
    await previewObjectInternal(item, false);
  };

  const previewDocumentObject = async (item) => {
    await previewObjectInternal(item, true);
  };

  // Update functions
  // const transformFormValues = async () => {
  //   try {
  //     setUpdatingObject(true);

  //     const requestData = {
  //       objectid: selectedObject.id,
  //       objectypeid: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
  //       classid: (selectedObject.classID !== undefined ? selectedObject.classID : selectedObject.classId),
  //       props: Object.entries(formValues).map(([id, { value, datatype }]) => {
  //         let transformedValue = value;

  //         switch (datatype) {
  //           case 'MFDatatypeMultiSelectLookup':
  //             transformedValue = value.join(", ");
  //             break;
  //           case 'MFDatatypeBoolean':
  //             transformedValue = value ? "true" : "false";
  //             break;
  //           case 'MFDatatypeNumber':
  //           case 'MFDatatypeLookup':
  //             transformedValue = value.toString();
  //             break;
  //           default:
  //             // No transformation for unknown datatype
  //             break;
  //         }

  //         return {
  //           id: parseInt(id, 10),
  //           value: transformedValue,
  //           datatype,
  //         };
  //       }),
  //       userID: parseInt(props.selectedVault?.vaultId, 10),
  //       vaultGuid: props.selectedVault?.guid || "",
  //     };

  //     console.log('Request Data:', requestData);

  //     // await axios.put(
  //     //   `${constants.mfiles_api}/api/objectinstance/UpdateObjectProps`,
  //     //   requestData,
  //     //   { headers: { accept: '*/*', 'Content-Type': 'application/json' } }
  //     // );

  //     setAlertPopOpen(true);
  //     setAlertPopSeverity("success");
  //     setAlertPopMessage("Updated successfully! Changes will be reflected next time item is loaded.");
  //     setFormValues({});
  //     setPreviewObjectProps([]);
  //     setSelectedObject({});

  //     handleTabAction()

  //     setTimeout(() => {
  //       if (selectedObject.id !== 0) {
  //         previewObject(selectedObject);
  //       } else {
  //         previewDocumentObject(selectedObject);
  //       }
  //     }, 10000);

  //   } catch (error) {
  //     console.error('Error updating object props:', error);
  //     setAlertPopOpen(true);
  //     setAlertPopSeverity("error");
  //     setAlertPopMessage("Something went wrong, please try again later!");
  //   } finally {
  //     setUpdatingObject(false);
  //   }
  // };
  const transformFormValues = async () => {
    const requestData = {
      objectid: selectedObject.id,
      objectypeid: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
      classid: (selectedObject.classID !== undefined ? selectedObject.classID : selectedObject.classId),
      props: Object.entries(formValues).map(([id, { value, datatype }]) => {
        let transformedValue = value;

        switch (datatype) {
          case 'MFDatatypeMultiSelectLookup':
            transformedValue = value.join(", ");
            break;
          case 'MFDatatypeBoolean':
            transformedValue = value ? "true" : "false";
            break;
          case 'MFDatatypeNumber':
          case 'MFDatatypeLookup':
            transformedValue = value.toString();
            break;
          default:
            break;
        }

        return {
          id: parseInt(id, 10),
          value: transformedValue,
          datatype,
        };
      }),
      userID: parseInt(props.selectedVault?.vaultId, 10),
      vaultGuid: props.selectedVault?.guid || "",
    };

    await axios.put(
      `${constants.mfiles_api}/api/objectinstance/UpdateObjectProps`,
      requestData,
      { headers: { accept: '*/*', 'Content-Type': 'application/json' } }
    );

    // Clear form values after successful update
    setFormValues({});

    // Return success indicator
    return { success: true };
  };

  const transitionState = async () => {
    try {
      setUpdatingObject(true);
      const data = {
        vaultGuid: props.selectedVault.guid,
        objectTypeId: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
        objectId: selectedObject.id,
        nextStateId: selectedState.id,
        userID: props.selectedVault?.vaultId
      };

      await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/SetObjectstate`, data, {
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
      });

      handleTabAction()

      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject(selectedObject);
        } else {
          previewDocumentObject(selectedObject);
        }
      }, 5000);

      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Updated successfully!");
    } catch (error) {
      console.error('Error transitioning state:', error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("Something went wrong, please try again later!");
    } finally {
      setUpdatingObject(false);
    }
  };

  const addNewWorkflowAndState = async () => {
    const hasNewWorkflow = Boolean(newWFState?.stateName);

    if (!hasNewWorkflow) {
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("Select a workflow state to save.");
      return;
    }

    try {
      setUpdatingObject(true);
      const data = {
        vaultGuid: props.selectedVault.guid,
        objectTypeId: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
        objectId: selectedObject.id,
        workflowId: newWF.workflowId,
        stateId: newWFState.stateId,
        userID: props.selectedVault?.vaultId
      };

      await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/SetObjectWorkflowstate`, data, {
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
      });

      handleTabAction()

      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject(selectedObject);
        } else {
          previewDocumentObject(selectedObject);
        }
      }, 5000);

      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Updated successfully!");
      setNewWF(null);
      setNewWFState(null);
    } catch (error) {
      console.error('Error transitioning state:', error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("Something went wrong, please try again later!");
    } finally {
      setUpdatingObject(false);
    }
  };

  const markAssignmentComplete = async () => {
    try {
      await axios.post(`${constants.mfiles_api}/api/objectinstance/ApproveAssignment`, approvalPayload, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      resetPreview();
      props.getAssigned?.();

      setApprovalPayload(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateClassValue = async () => {
    // ---- VALIDATION BEFORE API CALL ----
    const isPayloadValid =
      classUpdatePayload &&
      typeof classUpdatePayload === "object" &&
      Object.keys(classUpdatePayload).length > 0 &&
      classUpdatePayload.newClassID &&                       // must exist
      classUpdatePayload.oldClassID !== classUpdatePayload.newClassID; // avoid unnecessary call

    if (!isPayloadValid) {
      console.warn("Class update skipped: empty or invalid payload.");
      return;
    }

    try {
      setUpdatingObject(true);

      await axios.post(
        `${constants.mfiles_api}/api/objectinstance/ModifyObjectClass`,
        classUpdatePayload,
        {
          headers: { accept: "*/*", "Content-Type": "application/json" },
        }
      );
      setChangedClass(false);

      handleTabAction();
      resetPreview();

      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject(selectedObject);
        } else {
          previewDocumentObject(selectedObject);
        }
      }, 5000);


      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Updated successfully!");
    } catch (error) {
      console.error("Error updating class:", error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("Something went wrong, please try again later!");
    } finally {
      setUpdatingObject(false);
    }
  };




  // const updateObjectMetadata = async () => {
  //   const hasFormValues = Object.keys(formValues || {}).length > 0;
  //   const hasSelectedState = Boolean(selectedState?.title);
  //   const hasNewWorkflow = Boolean(newWF?.workflowName);

  //   try {
  //     setIsUpdatingMetadata(true);

  //     if (changedClass) {
  //       await updateClassValue()
  //     }

  //     if (hasFormValues) {
  //       await transformFormValues();
  //     }

  //     if (hasSelectedState) {
  //       await transitionState();
  //     }

  //     if (hasNewWorkflow) {
  //       await addNewWorkflowAndState();
  //     }

  //     if (approvalPayload) {
  //       await markAssignmentComplete();
  //     }

  //     // Only reload metadata if not approval-only update
  //     if (!approvalPayload) {
  //       await reloadObjectMetadata();
  //     }
  //     handleTabAction()

  //   } catch (error) {
  //     console.error('Error in updateObjectMetadata:', error);
  //     // Handle error as needed
  //   } finally {
  //     setDialogOpen(false);
  //     setUpdatingObject(false);
  //     setIsUpdatingMetadata(false);
  //   }
  // };

  const updateObjectMetadata = async () => {
    const hasFormValues = Object.keys(formValues || {}).length > 0;
    const hasSelectedState = Boolean(selectedState?.title);
    const hasNewWorkflow = Boolean(newWF?.workflowName);
    const hasApprovalPayload = Boolean(approvalPayload);
    const hasClassChange = Boolean(changedClass);

    // Early return if nothing to update
    if (!hasFormValues && !hasSelectedState && !hasNewWorkflow && !hasApprovalPayload && !hasClassChange) {
      setDialogOpen(false);
      return;
    }

    try {
      setIsUpdatingMetadata(true);
      setUpdatingObject(true);

      // Collect all update promises
      const updates = [];

      // 1. Class update (should happen first as it may affect other operations)
      if (hasClassChange) {
        updates.push(
          updateClassValue().catch(err => {
            console.error('Class update failed:', err);
            throw new Error('Class update failed');
          })
        );
      }

      // 2. Run these in parallel since they're independent
      const parallelUpdates = [];

      if (hasFormValues) {
        parallelUpdates.push(
          transformFormValues().catch(err => {
            console.error('Form values update failed:', err);
            return { error: 'form_values', message: err.message };
          })
        );
      }

      if (hasSelectedState) {
        parallelUpdates.push(
          transitionState().catch(err => {
            console.error('State transition failed:', err);
            return { error: 'state_transition', message: err.message };
          })
        );
      }

      if (hasNewWorkflow) {
        parallelUpdates.push(
          addNewWorkflowAndState().catch(err => {
            console.error('Workflow addition failed:', err);
            return { error: 'workflow_addition', message: err.message };
          })
        );
      }

      if (hasApprovalPayload) {
        parallelUpdates.push(
          markAssignmentComplete().catch(err => {
            console.error('Assignment completion failed:', err);
            return { error: 'assignment_completion', message: err.message };
          })
        );
      }

      // Wait for class update first, then parallel updates
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      if (parallelUpdates.length > 0) {
        const results = await Promise.all(parallelUpdates);

        // Check if any parallel updates failed
        const failures = results.filter(r => r?.error);
        if (failures.length > 0) {
          console.warn('Some updates failed:', failures);
          setAlertPopOpen(true);
          setAlertPopSeverity("warning");
          setAlertPopMessage(`Some updates completed with errors. Check console for details.`);
        }
      }

      // Single reload after all updates
      if (!hasApprovalPayload) {
        // Delay reload to allow backend to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        await reloadObjectMetadata();
      }

      // Single handleTabAction call
      handleTabAction();

      // Show success message if not already shown by individual functions
      if (!hasFormValues && !hasSelectedState && !hasNewWorkflow) {
        setAlertPopOpen(true);
        setAlertPopSeverity("success");
        setAlertPopMessage("Update completed successfully!");
      }

    } catch (error) {
      console.error('Error in updateObjectMetadata:', error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage(error.message || "Update failed. Please try again.");
    } finally {
      setDialogOpen(false);
      setUpdatingObject(false);
      setIsUpdatingMetadata(false);
    }
  };

  const reloadObjectMetadata = async () => {
    if (selectedObject.objectTypeId === 0) {
      await previewObject(selectedObject);
    } else {
      await previewDocumentObject(selectedObject);
    }
  };

  // Event handlers
  const handleRightClick = (event, item) => {
    event.preventDefault();
    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
    if ((item.objectID === 0 || item.objectTypeId === 0) && item.isSingleFile === true) {
      fetchObjectFile(item);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuItem(null);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAlertClose = () => {
    setAlertPopOpen(false);
  };

  const handleSearch = (e) => {
    resetPreview();
    setValue(0);
    e.preventDefault();
    setLoading(true);

    props.searchObject(props.searchTerm, props.selectedVault.guid).then((data) => {
      setLoading(false);
      setSearched(true);

      props.setData(data);
      // console.log(data)
    });
  };

  const discardChange = () => {
    setDialogOpen(false);
    setSelectedState({});
    setFormValues({});
    setNewWF(null);
    setNewWFState(null);
    setApprovalPayload(null);
  };

  const toggleSidebar = () => {
    props.setSidebarOpen(!props.sidebarOpen);
  };

  const resetPreview = () => {
    setSelectedItemId(null);
    setBase64('');
    setBlob(null);
    setBlobReport(null);
    setExtension('');
    setSelectedObject({});
    setPreviewObjectProps([]);
    setComments([]);
  };

  const reloadPage = () => {
    const authTokens = sessionStorage.getItem('authTokens');
    const selectedVault = sessionStorage.getItem('selectedVault');

    sessionStorage.clear();

    if (authTokens !== null) {
      sessionStorage.setItem('authTokens', authTokens);
    }

    if (selectedVault !== null) {
      sessionStorage.setItem('selectedVault', selectedVault);
    }

    window.location.reload();
  };

  function openApp(item) {

    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;

      try {
        const response = await axios.get(url);
        const data = response.data;
        const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();

        if (['csv', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf', 'ppt', 'jpeg', 'png', 'jpg', 'txt'].includes(extension)) {
          setObjectToEditOnOfficeApp({
            ...item,
            guid: props.selectedVault.guid,
            extension,
            type: item.objectTypeId ?? item.objectID,
          });
          setOpenOfficeApp(true);

        }


      } catch (error) {
        console.error('Error fetching extension:', error);
      }
    };
    fetchExtension();
  }

  const undoCheckout = async (objectType, objectId) => {
    const payload = {
      objecttypeid: objectType,
      objectid: objectId,
      vaultGuid: props.selectedVault.guid,
      userID: props.selectedVault?.vaultId,
    };
    console.log(payload)

    const headers = {
      Accept: '*/*',
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(
        `${constants.mfiles_api}/api/ObjectCheckout/UndoCheckout`,
        payload,
        { headers }
      );

      console.log('Response:', response.data);
      handleTabAction()
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const Checkout = async (objectType, objectId) => {
    const payload = {
      objecttypeid: objectType,
      objectid: objectId,
      vaultGuid: props.selectedVault.guid,
      userID: props.selectedVault?.vaultId,
    };
    // console.log(payload)

    const headers = {
      Accept: '*/*',
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(
        `${constants.mfiles_api}/api/ObjectCheckout/Checkout`,
        payload,
        { headers }
      );

      // console.log('Response:', response.data);
      handleTabAction()
    } catch (error) {
      console.error('Error:', error);
    }
  };



  const handleRowClick = (subItem) => {
    if (subItem.objectID === 0 || subItem.objectTypeId === 0) {
      previewDocumentObject(subItem);
    } else {
      previewObject(subItem);
    }
  };

  function toolTipTitle(item) {
    return (
      <span>
        {item.title}
        {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) ? (
          <FileExtText
            guid={props.selectedVault.guid}
            objectId={item.id}
            classId={item.classId || item.classID}
            version={item.versionId ?? null}
          />
        ) : null}
      </span>
    );
  }

  function handleClick(item) {

    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    clickTimeout = setTimeout(() => {
      setSelectedItemId(`${item.id}-${item.title}`);
      if ((item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true)) {
        previewDocumentObject(item);
      } else {
        previewObject(item);
      }
    }, 250);
  }

  function handleDoubleClick(item) {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    if ((item.objectTypeId === 0 || item.objectID === 0) && item.isSingleFile === true) {
      openApp(item);
    }
  }

  const getObjectComments2 = async () => {
    setLoadingComments(true);
    let objectID = selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId;

    const url = `${constants.mfiles_api}/api/Comments?ObjectId=${selectedObject.id}&VaultGuid=${props.selectedVault.guid}&ObjectTypeId=${objectID}`;

    try {
      const response = await axios.get(url, {
        headers: { 'accept': '*/*' }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Layout handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 && !isMobile) {
      setIsDragging(true);
    }
  }, [isMobile]);

  const rightClickActions = [];

  if (menuItem) {
    const isSingleFile = menuItem.isSingleFile === true;
    const isCheckedOut = menuItem.isCheckedOut === true;
    const checkoutByMe = Number(menuItem.checkoutuserid) === Number(props.selectedVault?.vaultId);
    const hasObject = menuItem.objectID > 0 || menuItem.objectTypeId > 0;
    const canEdit = menuItem.userPermission?.editPermission;
    const fileExt = file?.extension?.toLowerCase();

    // Open action
    if (isSingleFile && !hasObject && !isCheckedOut) {
      rightClickActions.push({
        label: (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <FileExtIcon
              fontSize="18px"
              guid={props.selectedVault.guid}
              objectId={menuItem.id}
              classId={menuItem.classId ?? menuItem.classID}
              version={menuItem.versionId ?? null}
            />
            <span className="mx-2">Open</span>
            <span className="text-muted" style={{ marginLeft: 'auto', fontWeight: 500 }}>
              Open in default application
            </span>
          </span>
        ),
        onClick: (itm) => {
          openApp(itm);
          handleMenuClose();
        },
      });
    }

    // Convert to PDF actions
    const convertibleExtensions = ['docx', 'doc', 'xlsx', 'xls', 'ppt', 'webp', 'tif', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    if (isSingleFile && !isCheckedOut && canEdit && fileExt && convertibleExtensions.includes(fileExt)) {
      rightClickActions.push(
        {
          label: (
            <>
              <FaArrowsSpin style={{ color: THEME_COLORS.primary }} />
              <span className="mx-3">Convert to PDF (Overwrite Original Copy) </span>
            </>
          ),
          onClick: (itm) => {
            handlePdfConversionRequest(itm, true);
            handleMenuClose();
          },
        },
        {
          label: (
            <>
              <FaArrowsSpin style={{ color: THEME_COLORS.primary }} />
              <span className="mx-3">Convert to PDF (Keep Original Copy)</span>
            </>
          ),
          onClick: (itm) => {
            handlePdfConversionRequest(itm, false);
            handleMenuClose();
          },
        }
      );
    }

    // Consolidate Linked Documents
    if (hasObject && !isCheckedOut) {
      rightClickActions.push({
        label: (
          <>
            <TbArrowMerge style={{ color: THEME_COLORS.primary }} />
            <span className="mx-3">Consolidate Linked Documents</span>
          </>
        ),
        onClick: (itm) => {
          handleMergeRequest(itm);
          handleMenuClose();
        },
      });
    }

    // Check In
    if (isCheckedOut && (checkoutByMe || props.user.is_admin === "True")) {
      rightClickActions.push({
        label: (
          <>
            <FiCheckSquare style={{ color: '#3fa34d' }} />
            <span className="mx-3">Check In </span>
          </>
        ),
        onClick: () => {
          undoCheckout(menuItem.objectID, menuItem.id);
          handleMenuClose();
        },
      });
    }

    // History
    if (!isCheckedOut && !checkoutByMe) {
      rightClickActions.push({
        label: (
          <>
            <FaHistory style={{ color: '#fca311' }} />
            <span className="mx-3">History</span>
          </>
        ),
        onClick: (itm) => {
          if (itm.objectID === 0 || itm.objectTypeId === 0) {
            setIsFile(true);
          }

          const fetchObjectVersions = async () => {
            setLoadingHistory(true);
            const url = `${constants.mfiles_api}/api/ObjectVersions/GetObjectVesions/${props.selectedVault.guid}/${itm.id}/${itm.classId ?? itm.classID}/${props.selectedVault?.vaultId}`;
            try {
              const response = await fetch(url, { method: 'GET', headers: { accept: '*/*' } });
              if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
              const data = await response.json();
              setObjectHistory(Array.isArray(data) ? data : [data]);
              setSelectedObject(itm);
            } catch (error) {
              console.error('Failed to fetch object versions:', error);
              setObjectHistory([]);
            } finally {
              setLoadingHistory(false);
            }
          };

          fetchObjectVersions();
          setOpenHistory(true);
        },
      });
    }
  }



  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let animationFrameId;

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const containerWidth = containerRef.current?.getBoundingClientRect().width;
        if (!containerWidth) return;

        let newCol1Width = (e.clientX / containerWidth) * 100;
        newCol1Width = Math.min(90, Math.max(10, newCol1Width));
        const newCol2Width = 100 - newCol1Width;

        if (col1Ref.current) col1Ref.current.style.width = `${newCol1Width}%`;
        if (col2Ref.current) col2Ref.current.style.width = `${newCol2Width}%`;

        setPreviewWindowWidth(`${newCol2Width}%`);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, isMobile, setPreviewWindowWidth]);

  useEffect(() => {
  }, [props.selectedVault?.vaultId]);






  return (
    <>

      <History
        open={openHistory}
        close={() => setOpenHistory(false)}
        data={objectHistory}
        setObjectHistory={setObjectHistory}
        loadingHisytory={loadingHisytory}
        setLoadingHistory={setLoadingHistory}
        selectedVault={props.selectedVault}
        mfilesId={props.selectedVault?.vaultId}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        handleRightClick={handleRightClick}
        handleRowClick={handleRowClick}
        toolTipTitle={toolTipTitle}
        setBlob={setBlob}
        setSelectedFileId={setSelectedFileId}
        setExtension={setExtension}
        setLoadingFile={setLoadingFile}
        a11yProps2={a11yProps2}
        headerTitle="History"
        nameColumnLabel="Name"
        dateColumnLabel="Date Modified"
        isFile={isFile}
        selectedObject={selectedObject}
        handleTabAction={handleTabAction}



      />
      <PdfMergeDialog
        open={mergeDialogOpen}
        onClose={handlMergeCancel}
        onConfirm={handleMergeConfirm}
        item={mergeItem}
        isConverting={isMergingToPdf}
      />

      <PdfConversionDialog
        open={pdfDialogOpen}
        onClose={handlePdfConversionCancel}
        onConfirm={handlePdfConversionConfirm}
        fileName={pdfConversionItem?.title || 'Unknown'}
        file={pdfConversionItem}
        vault={props.selectedVault}
        overwriteOriginal={pdfOverwriteOriginal}
        isConverting={isConvertingToPdf}
      />

      <ConfirmUpdateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={updateObjectMetadata}
        uptatingObject={updatingObject}
        message={selectedObject.title}
        discardChange={discardChange}
      />

      <TimedAlert
        open={alertOpen}
        onClose={handleAlertClose}
        severity={severity}
        message={message}
        setSeverity={setAlertPopSeverity}
        setMessage={setAlertPopMessage}
      />

      <OfficeApp
        open={openOfficeApp}
        close={() => setOpenOfficeApp(false)}
        object={objectToEditOnOffice}
        mfilesId={props.selectedVault?.vaultId}
        handleTabAction={() => handleTabAction()}
      />

      {/* Split column section */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: '#dedddd',
        height: '100vh',
      }} ref={containerRef}>

        {/* Object List */}
        <Box
          ref={col1Ref}
          sx={{
            width: isMobile ? '100%' : '40%',
            backgroundColor: '#fff',
            minWidth: '25%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 1,
            fontSize: '12.8px',
            backgroundColor: '#fff',
            color: THEME_COLORS.primary,
            overflow: 'hidden',
            maxHeight: '56px'
          }}>
            {/* Logo + Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                onClick={toggleSidebar}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  borderRadius: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#fff',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <FaBars style={{ fontSize: '25px', color: THEME_COLORS.primary }} />

              </Box>
              <img
                src={THEME_CONFIG.logos.brandLogo}
                alt="Logo"
                onClick={() => window.location.reload()}
                className="shadow-sm"
                style={{
                  height: "35px",
                  cursor: "pointer",
                  padding: "5px",
                  transition: "transform 0.2s ease-in-out",
                }}
              />

            </Box>

            {/* Right Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Switch to a different repository" placement="left" arrow>
                <Box sx={{ cursor: 'pointer' }}>
                  <VaultSelectForm activeVault={props.selectedVault} />
                </Box>
              </Tooltip>

              <UserAvatarMenu
                user={props.user}
                stringAvatar={props.stringAvatar}
                onLogout={props.logoutUser}
              />

            </Box>
          </Box>

          {/* Search Bar */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: THEME_COLORS.surfaceLight,
            p: 1.5
          }}>
            <Box sx={{ display: 'flex', width: '100%' }}>
              {/* Search Input */}
              <Box sx={{ flex: 1 }}>
                <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    required
                    placeholder="Search"
                    value={props.searchTerm}
                    onChange={(e) => props.setSearchTerm(e.target.value)}
                    className="form-control form-control-md "
                    style={{
                      fontSize: '12.8px',
                      borderRadius: '6px',
                      width: '100%',
                      paddingRight: '40px'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <FaSearch style={{ fontSize: '15px', color: '#6c757d' }} />

                  </button>
                </form>
              </Box>

              {/* Right Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AddButtonWithMenu
                  vaultObjectsList={props.vaultObjectsList}
                  fetchItemData={props.fetchItemData}
                />
              </Box>
            </Box>
          </Box>
          {/* <Button onClick={()=>{reloadViews();alert(value)}}>Reload Current Results</Button> */}

          {/* Tabs */}
          <Tabs
            variant="scrollable"
            value={value}
            onChange={handleChange}
            sx={{
              borderColor: 'divider',
              backgroundColor: THEME_COLORS.surfaceLight,
              minHeight: '36px',
              '& .MuiTab-root': {
                minHeight: '36px',
                height: '36px',
                p: '4px 12.8px',
                backgroundColor: THEME_COLORS.surfaceLight,
                minWidth: 'auto',
                textTransform: 'none',
                color: '#ccc',
                '&.Mui-selected': {
                  color: `${THEME_COLORS.primary} !important`,
                  fontWeight: 'normal !important',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: `${THEME_COLORS.primary} !important`,
                height: '1px',
                fontWeight: 'normal !important',

              }
            }}
          >
            {['Home', 'Recent', 'Assigned', 'Deleted', 'Reports'].map((label, index) => {
              const showAssignedCount = label === 'Assigned' && props.assignedData?.length; // number
              const showDeletedCount = label === 'Deleted' && props.deletedData?.length;
              return (
                <Tab
                  key={index}
                  label={
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px', // space between icon/text and count
                      }}
                    >
                      {/* Home icon */}
                      {label === 'Home' && (
                        <BiHomeAlt2
                          style={{
                            fontSize: '16px',
                            color: selectedTab === 'Home' ? THEME_COLORS.primary : '#ccc',
                          }}
                        />
                      )}

                      {/* Label text */}
                      <span>{label}</span>

                      {/* Assigned count */}
                      {showAssignedCount > 0 && (
                        <span
                          style={{
                            marginLeft: '1px',
                            fontSize: '12px',

                            color: selectedTab === 'Assigned' ? THEME_COLORS.primary : '#ccc'
                          }}
                        >
                          ({props.assignedData.length})
                        </span>
                      )}

                       {/* Assigned count */}
                      {showDeletedCount > 0 && (
                        <span
                          style={{
                            marginLeft: '1px',
                            fontSize: '12px',

                            color: selectedTab === 'Deleted' ? THEME_COLORS.primary : '#ccc'
                          }}
                        >
                          ({props.deletedData.length})
                        </span>
                      )}
                    </span>
                  }
                  onClick={() => {
                    setSelectedTab(label);
                    resetPreview();

                    if (label === 'Home') {
                      setSelectedViewObjects([]);
                      setViewNavigation([]);
                      setSearched(false);
                    }
                    if (label === 'Recent') props.getRecent?.();
                    if (label === 'Assigned') props.getAssigned?.();
                    if (label === 'Deleted') props.getDeleted?.();
                  }}
                  {...a11yProps(index)}
                />
              );
            })}



          </Tabs>

          {/* Tab Content */}
          <Box
            {...getRootProps()}
            sx={{
              flex: 1,
              overflow: 'hidden',
              border: '1px dashed #fff',
              backgroundColor: '#fff',
              cursor: 'pointer',
              transition: 'border 0.2s ease',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: '#fff',
              },
              '&.drag-active': {
                borderColor: '#fff',
                backgroundColor: '#fff',
              },
            }}>

            <CustomTabPanel value={value} index={0} style={{ backgroundColor: '#fff', padding: 0, width: '100%', height: '100%' }}>
              {loading ? (
                <>
                  <Box sx={{
                    p: 1,
                    fontSize: '12.8px',
                    backgroundColor: THEME_COLORS.surfaceLight,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    // color: '#333'
                  }}>
                    <CiCircleList style={{ fontSize: '1.5em', color: THEME_COLORS.primary }} />
                    Search Results
                  </Box>
                  <Loader />
                </>
              ) : (
                <>
                  {searched ? (
                    <>
                      <Box sx={{
                        p: 1,
                        fontSize: '12.8px',
                        backgroundColor: THEME_COLORS.surfaceLight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        // color: '#333'
                      }}>
                        <CiCircleList style={{ fontSize: '1.5em', color: THEME_COLORS.primary }} />
                        Search Results
                      </Box>
                      {props.data?.length > 0 ? (
                        <ColumnSimpleTree
                          data={props.data}
                          selectedVault={props.selectedVault}
                          mfilesId={props.selectedVault?.vaultId}
                          selectedItemId={selectedItemId}
                          setSelectedItemId={setSelectedItemId}
                          onItemClick={handleClick}
                          onItemDoubleClick={handleDoubleClick}
                          onItemRightClick={handleRightClick}
                          onRowClick={handleRowClick}
                          getTooltipTitle={toolTipTitle}
                          setBlob={setBlob}
                          setSelectedFileId={setSelectedFileId}
                          setExtension={setExtension}
                          setLoadingFile={setLoadingFile}
                          a11yProps={a11yProps2}
                          headerTitle="Search Results"
                          nameColumnLabel="Name"
                          dateColumnLabel="Date Modified"
                          handleTabAction={handleTabAction}
                        />
                      ) : (
                        <Box sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 3,
                          backgroundColor: '#fff'
                        }}>
                          <FaSearch style={{ fontSize: '40px', color: THEME_COLORS.primary, marginBottom: '16px' }} />

                          <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                            No Results Found
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
                            Please try a different search parameter
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <ViewsList
                      selectedFileId={selectedFileId}
                      // viewableobjects={props.viewableobjects}
                      previewDocumentObject={previewDocumentObject}
                      selectedObject={selectedObject}
                      loadingobjects={loadingobjects}
                      selectedVault={props.selectedVault}
                      setPreviewObjectProps={setPreviewObjectProps}
                      setLoadingPreviewObject={setLoadingPreviewObject}
                      previewObject={previewObject}
                      setAlertPopOpen={setAlertPopOpen}
                      setAlertPopSeverity={setAlertPopSeverity}
                      setAlertPopMessage={setAlertPopMessage}
                      user={props.user}
                      mfilesId={props.selectedVault?.vaultId}
                      resetPreview={resetPreview}
                      setSelectedItemId={setSelectedItemId}
                      selectedItemId={selectedItemId}
                      reloadPage={reloadPage}
                      selectedViewObjects={selectedViewObjects}
                      setSelectedViewObjects={setSelectedViewObjects}
                      viewNavigation={viewNavigation}
                      setViewNavigation={setViewNavigation}
                      viewNavigation2={viewNavigation2}
                      setViewNavigation2={setViewNavigation2}
                      handleDoubleClick={handleDoubleClick}
                      handleRightClick={handleRightClick}
                      handleClick={handleClick}
                      handleRowClick={handleRowClick}
                      setBlob={setBlob}
                      setSelectedFileId={setSelectedFileId}
                      setExtension={setExtension}
                      setLoadingFile={setLoadingFile}
                      toolTipTitle={toolTipTitle}
                      a11yProps={a11yProps2}
                      refreshKey={refreshKey}

                    />
                  )}
                </>
              )}
            </CustomTabPanel>

            {/* Other Tab Panels */}
            {[1, 2, 3].map((tabIndex) => {
              const dataKey = tabIndex === 1 ? 'recentData' : tabIndex === 2 ? 'assignedData' : 'deletedData';
              const title = tabIndex === 1 ? 'Recent' : tabIndex === 2 ? 'Assigned' : 'Deleted By Me';
              const emptyTitle = tabIndex === 1 ? 'Recently Accessed By Me' : tabIndex === 2 ? 'Assigned' : 'Deleted By Me';
              const emptySubtitle = tabIndex === 1 ? 'Recent is Empty' : tabIndex === 2 ? 'Assigned to me is empty' : 'Deleted is empty';

              return (
                <CustomTabPanel
                  key={tabIndex}
                  value={value}
                  index={tabIndex}
                  style={{ backgroundColor: '#fff', padding: 0, width: '100%', overflowY: 'auto' }}
                >
                  {loading || props.isLoadingAssigned || props.isLoadingRecent || props.isLoadingDeleted ? (
                    <>
                      <Box sx={{
                        p: 1,
                        fontSize: '12.8px',
                        backgroundColor: THEME_COLORS.surfaceLight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        // color: '#333'
                      }}>
                        <CiCircleList style={{ fontSize: '1.5em', color: THEME_COLORS.primary }} />

                        {title} ({props[dataKey]?.length || 0})
                      </Box>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {props[dataKey]?.length > 0 ? (
                        <>
                          <Box sx={{
                            p: 1,
                            fontSize: '12.8px',
                            backgroundColor: THEME_COLORS.surfaceLight,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            // color: '#333'
                          }}>
                            <CiCircleList style={{ fontSize: '1.5em', color: THEME_COLORS.primary }} />
                            {title} ({props[dataKey].length})
                          </Box>
                          <ColumnSimpleTree
                            data={props[dataKey]}
                            selectedVault={props.selectedVault}
                            mfilesId={props.selectedVault?.vaultId}
                            selectedItemId={selectedItemId}
                            setSelectedItemId={setSelectedItemId}
                            onItemClick={handleClick}
                            onItemDoubleClick={handleDoubleClick}
                            onItemRightClick={handleRightClick}
                            onRowClick={handleRowClick}
                            getTooltipTitle={toolTipTitle}
                            setBlob={setBlob}
                            setSelectedFileId={setSelectedFileId}
                            setExtension={setExtension}
                            setLoadingFile={setLoadingFile}
                            a11yProps={a11yProps2}
                            headerTitle="Search Results"
                            nameColumnLabel="Name"
                            dateColumnLabel="Date Modified"
                            handleTabAction={handleTabAction}

                          />
                        </>
                      ) : (
                        <>
                          <Box sx={{
                            p: 1,
                            fontSize: '12.8px',
                            backgroundColor: THEME_COLORS.surfaceLight,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            // color: '#333'
                          }}>
                            <CiCircleList style={{ fontSize: '1.5em', color: THEME_COLORS.primary }} />
                            {emptyTitle}
                          </Box>
                          <Box sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            backgroundColor: '#fff'
                          }}>
                            <FaBan style={{ fontSize: '40px', color: THEME_COLORS.primary, marginBottom: '16px' }} />
                            <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                              No Results Found
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
                              {emptySubtitle}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </CustomTabPanel>
              );
            })}
            <CustomTabPanel value={value} index={4} style={{ backgroundColor: '#fff', padding: 0, width: '100%', height: '100%' }}>
              <ChartGenerator vaultGuid={props.selectedVault?.guid} />
            </CustomTabPanel>

          </Box>
        </Box>

        {/* Resizer */}
        {!isMobile && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              width: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ddd',
              cursor: 'ew-resize',
              transition: 'width 0.2s ease',
              height: '100vh'
            }}
          />
        )}

        {/* Object View */}
        <Box
          ref={col2Ref}
          sx={{
            width: isMobile ? '100%' : '60%',
            backgroundColor: THEME_COLORS.surfaceLight,
            minWidth: '25%',
            height: '100%'
          }}
        >
          <ObjectData
            changedClass={changedClass}
            setChangedClass={setChangedClass}
            classUpdatePayload={classUpdatePayload}
            setClassUpdatePayload={setClassUpdatePayload}
            setPreviewObjectProps={setPreviewObjectProps}
            setSelectedObject={setSelectedObject}
            resetViews={props.resetViews}
            mfilesId={props.selectedVault?.vaultId}
            user={props.user}
            getObjectComments={getObjectComments2}
            getAssigned={props.getAssigned}
            comments={comments}
            loadingcomments={loadingcomments}
            discardChange={discardChange}
            openDialog={() => setDialogOpen(true)}
            updateObjectMetadata={updateObjectMetadata}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            currentState={currentState}
            selectedObjWf={selectedObjWf}
            transformFormValues={transformFormValues}
            formValues={formValues}
            setFormValues={setFormValues}
            vault={props.selectedVault}
            email={props.user.email}
            selectedFileId={selectedFileId}
            previewObjectProps={previewObjectProps}
            loadingPreviewObject={loadingPreviewObject}
            selectedObject={selectedObject}
            extension={extension}
            base64={base64}
            blob={blob}
            blobReport={blobReport}
            loadingobjects={loadingobjects}
            loadingfile={loadingfile}
            loadingobject={loadingobject}
            windowWidth={previewWindowWidth}
            newWF={newWF}
            newWFState={newWFState}
            setNewWFState={setNewWFState}
            setNewWF={setNewWF}
            workflows={workflows}
            approvalPayload={approvalPayload}
            setApprovalPayload={setApprovalPayload}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            loadingWFS={loadingWFS}
            a11yProps={a11yProps2}
            isUpdatingMetadata={isUpdatingMetadata}
            groupedItems={props.groupedItems}
            ungroupedItems={props.ungroupedItems}
          />
        </Box>
      </Box>

      {/* Right Click Menu */}
      {rightClickActions.length > 0 && (
        <RightClickMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          item={menuItem}
          actions={rightClickActions}
        />
      )}
    </>
  );
};

export default DashboardContent;