import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as constants from '../../Auth/configs';
import TimedAlert from '../../TimedAlert';

// Import separated dialog components
import MainObjectDialog from './MainObjectDialog';
import ClassSelectionDialog from './ClassSelectionDialog';
import TemplateSelectionDialog from './TemplateSelectionDialog';
import ObjectFormDialog from './ObjectFormDialog';

// Main Component
const NewObjectDialog = (props) => {
    const [miniLoader, setMiniLoader] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [fileUploadError, setFileUploadError] = useState('');
    // const [uploadedFile, setUploadedFile] = useState(null);
    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [addingValueListItem, setAddingValueListItem] = useState(false);

    // Memoized filtered properties
    const filteredProperties = useMemo(() =>
        props.formProperties.filter(
            prop => prop.propId >= 1000 || [0, 37, 38, 39, 41, 42, 43, 44].includes(prop.propId)
        ),
        [props.formProperties]
    );

    const closeFormDialog = useCallback(() => {
        props.setIsFormOpen(false);
    }, [props.setIsFormOpen]);

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
                if (!addingValueListItem) {
                    props.setIsDataOpen(true);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            props.setIsLoading(false);
        }
    }, [props, addingValueListItem]);

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

    const blobToBase64WithExtension = useCallback((blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                let extension = '';

                if (blob.name && typeof blob.name === 'string') {
                    const parts = blob.name.split('.');
                    if (parts.length > 1) {
                        extension = parts.pop().toLowerCase();
                    }
                } else {
                    const mimeType = blob.type;
                    if (mimeType === 'application/pdf') extension = 'pdf';
                    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') extension = 'docx';
                    else if (mimeType === 'image/png') extension = 'png';
                    else if (mimeType === 'image/jpeg') extension = 'jpg';
                    else extension = '';
                }

                resolve({ base64: base64Data, extension });
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);

    const handleFileChange = useCallback(async (file) => {
        if (file) setFileUploadError('');
        props.setUploadedFile(file);
    }, []);

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
        if (isFileRequired) setFileUploadError('File upload is required.');

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
        console.log('Base Payload:', basePayload);

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

            if (!addingValueListItem) {
                props.closeModal();
            }

            setAddingValueListItem(false);

            setTimeout(() => {
                props.getRecent?.();
                props.getAssigned?.();
            }, 10000);

        } catch (error) {
            console.error('Error submitting form:', error);
            setMiniLoader(false);
            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg("Error submitting form. Please try again.");
        }
    }, [filteredProperties, props, props.uploadedFile, closeFormDialog, addingValueListItem]);

    const handleSearchTermChange = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value.toLowerCase());
    }, []);

    const handleClassSelection = useCallback((classId, className, objectId) => {
        props.handleClassSelection(classId, className, objectId);
        setSearchQuery('');
    }, [props.handleClassSelection]);

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
                fetchItemData={fetchItemData}
                setAddingValueListItem={setAddingValueListItem}
                onUseTemplate={props.UseTemplate}
                onDontUseTemplates={props.dontUseTemplates}
            />
        </>
    );
};

export default NewObjectDialog;