import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as constants from '../../Auth/configs';
import TimedAlert from '../../TimedAlert';

// Import separated dialog components
import MainObjectDialog from './MainObjectDialog';
import ClassSelectionDialog from './ClassSelectionDialog';
import TemplateSelectionDialog from './TemplateSelectionDialog';
import ObjectFormDialog from './ObjectFormDialog';
import ValueListObjectDialog from './ValueListObjectDialog';

// Main Component
const NewObjectDialog = (props) => {
    const [miniLoader, setMiniLoader] = useState(false);
    const [miniLoaderVL, setMiniLoaderVL] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [VLformErrors, setVLFormErrors] = useState({});
    const [fileUploadError, setFileUploadError] = useState('');
    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [, setAddingValueListItem] = useState('')

    // Value list object dialog state - SEPARATE from main form
    const [valueListDialogOpen, setValueListDialogOpen] = useState(false);
    const [valueListObjectId, setValueListObjectId] = useState(null);
    const [valueListClassId, setValueListClassId] = useState(null);
    const [valueListObjectName, setValueListObjectName] = useState('');

    // SEPARATE state for value list form - this is the key fix
    const [VLformProperties, setVLFormProperties] = useState([]);
    const [VLformValues, setVLFormValues] = useState({});

    // Memoized filtered properties
    const filteredProperties = useMemo(() =>
        props.formProperties.filter(
            prop => prop.propId >= 1000 || [0, 37, 38, 39, 41, 42, 43, 44].includes(prop.propId)
        ),
        [props.formProperties]
    );

    const filteredVLProperties = useMemo(() =>
        VLformProperties.filter(
            prop => prop.propId >= 1000 || [0, 37, 38, 39, 41, 42, 43, 44].includes(prop.propId)
        ),
        [VLformProperties]
    );

    const closeFormDialog = useCallback(() => {
        props.setIsFormOpen(false);
    }, [props]);

    const fetchItemData = useCallback(async (objectid, objectname) => {
        setSearchTerm("");
        props.setSelectedObjectName(objectname);
        props.setIsLoading(true);

        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.selectedVault.guid}/${objectid}/${props.mfilesId}`
            );

            props.setSelectedObjectId(objectid);
            props.setGroupedItems(response.data.grouped);
            props.setUngroupedItems(response.data.unGrouped);

            const totalClasses = response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) +
                response.data.unGrouped.length;

            if (totalClasses === 1) {
                if (response.data.grouped.length > 0) {
                    props.handleClassSelection(
                        response.data.grouped[0].members[0].classId,
                        response.data.grouped[0].members[0].className,
                        objectid,
                    );
                } else {
                    props.handleClassSelection(
                        response.data.unGrouped[0].classId,
                        response.data.unGrouped[0].className,
                        objectid,
                    );
                }
            } else {
                props.setIsLoading(false);
                props.setIsDataOpen(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            props.setIsLoading(false);
        }
    }, [props]);

    const fetchItemDataVL = useCallback(
        async (objectid, objectname) => {
            setSearchTerm("");
            props.setIsLoading(true);

            try {
                const response = await axios.get(
                    `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.selectedVault.guid}/${objectid}/${props.mfilesId}`
                );

                const totalClasses =
                    response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) +
                    response.data.unGrouped.length;

                if (totalClasses === 1) {
                    // When only ONE class is available
                    if (response.data.grouped.length > 0) {
                        const item = response.data.grouped[0].members[0];
                        setValueListClassId(item.classId);
                        await handleClassSelectionVL(item.classId, item.className, objectid);
                    } else {
                        const item = response.data.unGrouped[0];
                        setValueListClassId(item.classId);
                        await handleClassSelectionVL(item.classId, item.className, objectid);
                    }
                } else {
                    // When MULTIPLE classes available → open class selection dialog
                    props.setIsLoading(false);
                    props.setIsDataOpen(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                props.setIsLoading(false);
            }
        },
        [props.selectedVault?.guid, props.mfilesId, props.setIsLoading, props.setIsDataOpen]
    );

    // Handle class selection for Value List objects - SEPARATE logic
    const handleClassSelectionVL = useCallback(async (classId, className, objectId) => {
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${objectId}/${classId}/${props.mfilesId}`
            );

            // Set SEPARATE form properties for VL
            setVLFormProperties(response.data);
            setVLFormValues(
                response.data.reduce((acc, prop) => {
                    acc[prop.propId] = '';
                    return acc;
                }, {})
            );

            setValueListClassId(classId);
        } catch (error) {
            console.error('Error fetching VL class properties:', error);
        }
    }, [props.selectedVault?.guid, props.mfilesId]);

    // Handle opening value list object dialog
    const handleOpenValueListDialog = useCallback(
        async (objectid, objectname) => {
            console.log("🎯 Opening value list dialog for:", objectname);

            setValueListObjectId(objectid);
            setValueListObjectName(objectname);

            await fetchItemDataVL(objectid, objectname);

            setValueListDialogOpen(true);
        },
        [fetchItemDataVL]
    );

    // Handle value list object creation success
    const handleValueListSuccess = useCallback(() => {
        console.log('✅ Value list object created successfully');
        setValueListDialogOpen(false);
        // Clear VL form state
        setVLFormProperties([]);
        setVLFormValues({});
        setVLFormErrors({});
        // The main form remains open and unchanged
    }, []);

    const handleInputChange = useCallback((propId, value) => {
        props.setFormValues({
            ...props.formValues,
            [propId]: value
        });

        const property = filteredProperties.find(prop => prop.propId === propId);
        const newFormErrors = { ...formErrors };

        if (!value && property.isRequired && !property.isAutomatic) {
            newFormErrors[propId] = `${property.title} is required`;
        } else {
            delete newFormErrors[propId];
        }

        setFormErrors(newFormErrors);
    }, [props.formValues, props.setFormValues, filteredProperties, formErrors]);

    const handleVLObjInputChange = useCallback((propId, value) => {
        // Update SEPARATE VL form values
        setVLFormValues(prev => ({
            ...prev,
            [propId]: value
        }));

        const property = filteredVLProperties.find(prop => prop.propId === propId);
        const newFormErrors = { ...VLformErrors };

        if (!value && property?.isRequired && !property?.isAutomatic) {
            newFormErrors[propId] = `${property.title} is required`;
        } else {
            delete newFormErrors[propId];
        }

        setVLFormErrors(newFormErrors);
    }, [filteredVLProperties, VLformErrors]);

    const handleFileChange = useCallback(async (file) => {
        if (file) setFileUploadError('');
        props.setUploadedFile(file);
    }, [props]);

    const handleSubmit = useCallback(async () => {
        const newFormErrors = {};
        const propertiesPayload = filteredProperties
            .filter(prop => props.formValues[prop.propId] !== undefined && props.formValues[prop.propId] !== '' && !prop.isAutomatic)
            .map(prop => ({
                value: `${props.formValues[prop.propId]}`,
                propId: prop.propId,
                propertytype: prop.propertytype
            }));

        propertiesPayload.forEach(prop => {
            if (prop.isRequired && !props.formValues[prop.propId]) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        const isFileRequired = props.selectedObjectId === 0 && !props.templateIsTrue && !props.uploadedFile;
        if (isFileRequired) {
            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg("File upload is required.");
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || isFileRequired) {
            setFormErrors(newFormErrors);
            return;
        }

        setMiniLoader(true);

        const basePayload = {
            objectTypeID: props.selectedObjectId,
            classID: props.selectedClassId,
            properties: propertiesPayload,
            vaultGuid: props.selectedVault.guid,
            objectID: props.selectedTemplate?.id || props.selectedObjectId,
            userID: parseInt(props.mfilesId, 10)
        };

        const headers = { 'Content-Type': 'application/json', accept: '*/*' };

        try {
            let payload = { ...basePayload };

            if (!props.templateIsTrue) {
                if (props.selectedObjectId === 0 && props.uploadedFile) {
                    const formData = new FormData();
                    formData.append('formFiles', props.uploadedFile);
                    

                    const uploadResponse = await axios.post(
                        `${constants.mfiles_api}/api/objectinstance/FilesUploadAsync`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data', accept: '*/*' } }
                    );

                    payload.uploadId = uploadResponse.data.uploadID;
                }
                console.log(payload)

                await axios.post(`${constants.mfiles_api}/api/objectinstance/ObjectCreation`, payload, { headers });
                props.setUploadedFile(null);
            } else {
                await axios.post(`${constants.mfiles_api}/api/Templates/ObjectCreation`, payload, { headers });
                props.setTemplateModalOpen(false);
                props.setVaultObjectsModal(false);
                props.setTemplateIsTrue(false);
            }

            setMiniLoader(false);
            setOpenAlert(true);
            setAlertSeverity("success");
            setAlertMsg("Created successfully");
            closeFormDialog();
            props.closeModal();

            setTimeout(() => {
                props.getRecent?.();
                props.getAssigned?.();
            }, 10000);

        } catch (error) {
            console.error('Error submitting form:', error);
            setMiniLoader(false);
            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg("Error submitting form.", error);
        }
    }, [filteredProperties, props, closeFormDialog]);

    const handleSubmitVObject = useCallback(async () => {
        const newFormErrors = {};
        const propertiesPayload = filteredVLProperties
            .filter(prop => VLformValues[prop.propId] !== undefined && VLformValues[prop.propId] !== '' && !prop.isAutomatic)
            .map(prop => ({
                value: `${VLformValues[prop.propId]}`,
                propId: prop.propId,
                propertytype: prop.propertytype
            }));

        // Validate required fields
        filteredVLProperties.forEach(prop => {
            if (prop.isRequired && !VLformValues[prop.propId] && !prop.isAutomatic) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (Object.keys(newFormErrors).length > 0) {
            setVLFormErrors(newFormErrors);
            return;
        }

        setMiniLoaderVL(true);

        const basePayload = {
            objectTypeID: valueListObjectId,
            classID: valueListClassId,
            properties: propertiesPayload,
            vaultGuid: props.selectedVault.guid,
            objectID: valueListObjectId,
            userID: parseInt(props.mfilesId, 10)
        };

        const headers = { 'Content-Type': 'application/json', accept: '*/*' };

        try {
            await axios.post(`${constants.mfiles_api}/api/objectinstance/ObjectCreation`, basePayload, { headers });

            setMiniLoaderVL(false);
            setOpenAlert(true);
            setAlertSeverity("success");
            setAlertMsg("Value list object created successfully");

            // Close VL dialog and clear its state
            handleValueListSuccess();

        } catch (error) {
            console.error('Error submitting VL form:', error);
            setMiniLoaderVL(false);
            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg("Error creating value list object. Please try again.");
        }
    }, [filteredVLProperties, VLformValues, valueListObjectId, valueListClassId, props.selectedVault?.guid, props.mfilesId, handleValueListSuccess]);

    const handleSearchTermChange = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value.toLowerCase());
    }, []);

    const handleClassSelection = useCallback((classId, className, objectId) => {
        props.handleClassSelection(classId, className, objectId);
        setSearchQuery('');
    }, [props]);

    const handleClassChange = useCallback(async (classId, className, objectId) => {
        try {
            // Fetch new class properties without closing the form
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${objectId}/${classId}/${props.mfilesId}`
            );

            // Update form properties with new class properties
            props.setFormProperties(response.data);

            // Reset form values for the new class
            const newFormValues = response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {});
            props.setFormValues(newFormValues);

            // Clear any form errors
            setFormErrors({});

            // Update selected class information
            props.setSelectedClassId(classId);
            props.setSelectedClassName(className);

            // Keep the form dialog open - no need to close it

        } catch (error) {
            console.error('Error fetching new class properties:', error);
            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg("Error loading class properties. Please try again.");
        }
    }, [props]);

    return (
        <>
            <TimedAlert
                open={alertOpen}
                onClose={setOpenAlert}
                severity={alertSeverity}
                message={alertMsg}
                setSeverity={setAlertSeverity}
                setMessage={setAlertMsg}
            />

            <MainObjectDialog
                open={props.vaultObjectModalsOpen}
                onClose={props.closeModal}
                vaultObjectsList={props.vaultObjectsList}
                onSelectItem={fetchItemData}
                searchTerm={searchTerm}
                onSearchChange={handleSearchTermChange}
            />

            <ClassSelectionDialog
                open={props.isDataOpen}
                onClose={props.closeDataDialog}
                selectedObjectName={props.selectedObjectName}
                selectedObjectId={props.selectedObjectId}
                isLoading={props.isLoading}
                groupedItems={props.groupedItems}
                ungroupedItems={props.ungroupedItems}
                onClassSelect={handleClassSelection}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />

            <TemplateSelectionDialog
                open={props.templateModalOpen}
                onClose={() => props.setTemplateModalOpen(false)}
                selectedClassName={props.selectedClassName}
                selectedObjectId={props.selectedObjectId}
                templates={props.templates}
                onUseTemplate={props.UseTemplate}
                onDontUseTemplates={props.dontUseTemplates}
            />

            <ObjectFormDialog
                open={props.isFormOpen}
                onClose={() => {
                    closeFormDialog();
                    props.setTemplateIsTrue(false);
                    props.setUploadedFile(null);
                }}
                selectedObjectId={props.selectedObjectId}
                selectedClassName={props.selectedClassName}
                selectedClassId={props.selectedClassId}  // ADD THIS
                filteredProperties={filteredProperties}
                formValues={props.formValues}
                formErrors={formErrors}
                selectedTemplate={props.selectedTemplate}
                selectedVault={props.selectedVault}
                templateIsTrue={props.templateIsTrue}
                templates={props.templates}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onFileChange={handleFileChange}
                uploadedFile={props.uploadedFile}
                miniLoader={miniLoader}
                mfilesId={props.mfilesId}
                handleClassSelection={handleClassSelection}
                fetchItemData={handleOpenValueListDialog}
                setAddingValueListItem={() => { }}
                onUseTemplate={props.UseTemplate}
                onDontUseTemplates={props.dontUseTemplates}
                groupedItems={props.groupedItems}  // ADD THIS
                ungroupedItems={props.ungroupedItems}  // ADD THIS
                onClassChange={handleClassChange}  // ADD THIS
                setOpenAlert={setOpenAlert}
                setAlertSeverity={setAlertSeverity}
                setAlertMsg={setAlertMsg}
            />

            {/* Separate dialog for value list objects with SEPARATE state */}
            <ValueListObjectDialog
                open={valueListDialogOpen}
                onClose={() => {
                    setValueListDialogOpen(false);
                    setVLFormProperties([]);
                    setVLFormValues({});
                    setVLFormErrors({});
                }}
                selectedObjectId={valueListObjectId}
                selectedClassName={valueListObjectName}
                filteredProperties={filteredVLProperties}
                formValues={VLformValues}
                formErrors={VLformErrors}
                selectedVault={props.selectedVault}
                onInputChange={handleVLObjInputChange}
                onSubmit={handleSubmitVObject}
                miniLoader={miniLoader}
                mfilesId={props.mfilesId}
            />
        </>
    );
};

export default NewObjectDialog;