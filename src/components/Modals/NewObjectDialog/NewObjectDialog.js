import React, { useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import * as constants from '../../Auth/configs';
import TimedAlert from '../../TimedAlert';

import MainObjectDialog from './MainObjectDialog';
import ClassSelectionDialog from './ClassSelectionDialog';
import TemplateSelectionDialog from './TemplateSelectionDialog';
import ObjectFormDialog from './ObjectFormDialog';
import ValueListObjectDialog from './ValueListObjectDialog';
import BackgroundTaskTracker from './Backgroundtasktracker';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [addingValuListItem, setAddingValueListItem] = useState('');

    // ── Background AI classification task queue ───────────────────────────────
    // Each entry: { id, fileName, file, status: 'running'|'done'|'error', message?, result? }
    const [bgTasks, setBgTasks] = useState([]);
    const bgAbortRefs = useRef({});

    // ── Queue of completed background tasks waiting to be opened ─────────────
    // When a task completes but a form/dialog is already open, we park it here.
    // As soon as the active form closes, we pop the next one.
    const pendingOpenQueue = useRef([]);

    const classSelectionRef = useRef(null);
    const [pendingFilesQueue, setPendingFilesQueue] = useState([]);

    // Value list object dialog state
    const [valueListDialogOpen, setValueListDialogOpen] = useState(false);
    const [valueListObjectId, setValueListObjectId] = useState(null);
    const [valueListClassId, setValueListClassId] = useState(null);
    const [valueListObjectName, setValueListObjectName] = useState('');
    const [VLformProperties, setVLFormProperties] = useState([]);
    const [VLformValues, setVLFormValues] = useState({});

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

    // ── Is any primary dialog currently open? ─────────────────────────────────
    const isAnyDialogOpen = useCallback(() => {
        return props.isFormOpen || props.isDataOpen || props.vaultObjectModalsOpen;
    }, [props.isFormOpen, props.isDataOpen, props.vaultObjectModalsOpen]);

    const closeFormDialog = useCallback(() => {
        props.setIsFormOpen(false);
    }, [props]);

    const fetchItemData = useCallback(async (objectid, objectname) => {
        setSearchTerm('');
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
                    props.handleClassSelection(response.data.grouped[0].members[0].classId, response.data.grouped[0].members[0].className, objectid);
                } else {
                    props.handleClassSelection(response.data.unGrouped[0].classId, response.data.unGrouped[0].className, objectid);
                }
            } else {
                props.setIsLoading(false);
                props.setIsDataOpen(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            props.setIsLoading(false);
        }
    }, [props]);

    const fetchItemDataVL = useCallback(async (objectid, objectname) => {
        setSearchTerm('');
        props.setIsLoading(true);
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.selectedVault.guid}/${objectid}/${props.mfilesId}`
            );

            const totalClasses = response.data.grouped.reduce((acc, g) => acc + g.members.length, 0) + response.data.unGrouped.length;

            if (totalClasses === 1) {
                const item = response.data.grouped.length > 0 ? response.data.grouped[0].members[0] : response.data.unGrouped[0];
                setValueListClassId(item.classId);
                await handleClassSelectionVL(item.classId, item.className, objectid);
            } else {
                props.setIsLoading(false);
                props.setIsDataOpen(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            props.setIsLoading(false);
        }
    }, [props.selectedVault?.guid, props.mfilesId, props.setIsLoading, props.setIsDataOpen]);

    const handleClassSelectionVL = useCallback(async (classId, className, objectId) => {
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${objectId}/${classId}/${props.mfilesId}`
            );
            setVLFormProperties(response.data);
            setVLFormValues(response.data.reduce((acc, prop) => { acc[prop.propId] = ''; return acc; }, {}));
            setValueListClassId(classId);
        } catch (error) {
            console.error('Error fetching VL class properties:', error);
        }
    }, [props.selectedVault?.guid, props.mfilesId]);

    const handleOpenValueListDialog = useCallback(async (objectid, objectname) => {
        setValueListObjectId(objectid);
        setValueListObjectName(objectname);
        await fetchItemDataVL(objectid, objectname);
        setValueListDialogOpen(true);
    }, [fetchItemDataVL]);

    const handleValueListSuccess = useCallback(() => {
        setValueListDialogOpen(false);
        setVLFormProperties([]);
        setVLFormValues({});
        setVLFormErrors({});
    }, []);

    const handleInputChange = useCallback((propId, value) => {
        props.setFormValues({ ...props.formValues, [propId]: value });
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
        setVLFormValues(prev => ({ ...prev, [propId]: value }));
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

    // ── Apply a completed background task result to the form ─────────────────
    const applyBgTaskResult = useCallback(async (task) => {
        const { result, file } = task;
        if (!result) return;
        try {
            props.setIsLoading(true);
            const resolvedObjectId = props.selectedObjectId;

            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${resolvedObjectId}/${result.class}/${props.mfilesId}`
            );

            const aiValueMap = {};
            (result.properties || []).forEach(({ propId, propertytype, value }) => {
                if (propertytype === 'MFDatatypeMultiSelectLookup') {
                    aiValueMap[propId] = value ? (Array.isArray(value) ? value : String(value).split(',').map(v => v.trim()).filter(Boolean)) : [];
                } else {
                    aiValueMap[propId] = value ?? '';
                }
            });

            const mergedValues = response.data.reduce((acc, prop) => {
                acc[prop.propId] = prop.propertytype === 'MFDatatypeMultiSelectLookup'
                    ? (aiValueMap[prop.propId] ?? [])
                    : (aiValueMap[prop.propId] ?? '');
                return acc;
            }, {});

            let resolvedClassName = '';
            props.groupedItems?.forEach(g => {
                const match = g.members.find(m => m.classId === result.class);
                if (match) resolvedClassName = match.className;
            });
            if (!resolvedClassName) {
                const match = props.ungroupedItems?.find(m => m.classId === result.class);
                if (match) resolvedClassName = match.className;
            }

            props.setFormProperties(response.data);
            props.setFormValues(mergedValues);
            props.setSelectedClassId(result.class);
            props.setSelectedClassName(resolvedClassName);
            setFormErrors({});

            if (file) props.setUploadedFile(file);

            props.closeDataDialog?.();
            props.setIsFormOpen(true);
        } catch (err) {
            console.error('Error applying background task result:', err);
            setOpenAlert(true);
            setAlertSeverity('error');
            setAlertMsg('Could not load AI classification result. Please try again.');
        } finally {
            props.setIsLoading(false);
        }
    }, [props]);

    // ── Background task: enqueue files for AI classification ─────────────────
    const handleEnqueueBackground = useCallback((files) => {
        if (!files?.length) return;

        const newTasks = files.map(file => ({
            id:       file.name + file.size + Date.now(),
            fileName: file.name,
            file,
            status:   'running',
            message:  null,
            result:   null,
        }));

        setBgTasks(prev => [...prev, ...newTasks]);

        // Close dialogs so user can work freely
        props.closeDataDialog?.();
        props.setIsFormOpen?.(false);

        newTasks.forEach(async (task) => {
            const abort = new AbortController();
            bgAbortRefs.current[task.id] = abort;

            try {
                const formData = new FormData();
                formData.append('Files', task.file);
                formData.append('user_id', props.mfilesId);
                formData.append('vault', props.selectedVault?.guid ?? '');
                formData.append('backend_url', 'https://api.alignsys.tech');

                const response = await fetch('https://llm.alignsys.tech/classification/propose', {
                    method:  'POST',
                    headers: { accept: 'application/json' },
                    body:    formData,
                    signal:  abort.signal,
                });

                if (!response.ok) throw new Error(`Classification failed: ${response.statusText}`);

                const data   = await response.json();
                const result = data?.results?.[0];
                if (!result) throw new Error('No result returned.');

                // Store result on the task — do NOT open the form yet
                setBgTasks(prev =>
                    prev.map(t => t.id === task.id
                        ? { ...t, status: 'done', message: 'Classification complete', result }
                        : t
                    )
                );

                // If no dialog is currently open, pop this task immediately
                // (check after a tick so state has settled)
                setTimeout(() => {
                    setBgTasks(currentTasks => {
                        const isOpen = props.isFormOpen || props.isDataOpen || props.vaultObjectModalsOpen;
                        if (!isOpen) {
                            const completedTask = currentTasks.find(t => t.id === task.id && t.status === 'done');
                            if (completedTask) {
                                applyBgTaskResult(completedTask);
                                // Mark as 'opening' so it doesn't double-open
                                return currentTasks.map(t => t.id === task.id ? { ...t, status: 'opening' } : t);
                            }
                        }
                        return currentTasks;
                    });
                }, 300);

            } catch (err) {
                if (err.name === 'AbortError') return;
                setBgTasks(prev =>
                    prev.map(t => t.id === task.id ? { ...t, status: 'error', message: err.message || 'Classification failed.' } : t)
                );
            } finally {
                delete bgAbortRefs.current[task.id];
            }
        });
    }, [props.mfilesId, props.selectedVault, applyBgTaskResult]);

    // ── User manually clicks a done task row ─────────────────────────────────
    const handleOpenBgTask = useCallback((task) => {
        if (task.status !== 'done' || !task.result) return;

        // Mark the task as opening to remove it from the queue
        setBgTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'opening' } : t));
        applyBgTaskResult(task);
    }, [applyBgTaskResult]);

    // ── When ObjectFormDialog closes, check if there's a queued bg task ──────
    const handleFormClose = useCallback(() => {
        closeFormDialog();
        props.setTemplateIsTrue(false);
        props.setUploadedFile(null);
        setPendingFilesQueue([]);

        // After a tick, pop the next completed bg task if any
        setTimeout(() => {
            setBgTasks(prev => {
                const next = prev.find(t => t.status === 'done');
                if (next) {
                    applyBgTaskResult(next);
                    return prev.map(t => t.id === next.id ? { ...t, status: 'opening' } : t);
                }
                return prev;
            });
        }, 250);
    }, [closeFormDialog, props, applyBgTaskResult]);

    // ── After successful object creation, remove the task + check queue ──────
    const handleTaskCreated = useCallback((taskId) => {
        setBgTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    const handleCloseAll = useCallback(() => {
        Object.values(bgAbortRefs.current).forEach(ctrl => ctrl.abort());
        bgAbortRefs.current = {};
        setBgTasks([]);
        props.closeDataDialog?.();
        props.setIsFormOpen?.(false);
        props.closeModal?.();
        setPendingFilesQueue([]);
    }, [props]);

    const handleDismissBgTask = useCallback((id) => {
        setBgTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    const handleSubmit = useCallback(async () => {
        const newFormErrors = {};

        filteredProperties.forEach(prop => {
            const rawValue = props.formValues[prop.propId];
            if (prop.isRequired && !prop.isAutomatic && (!rawValue || !rawValue.toString().trim())) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        const propertiesPayload = filteredProperties
            .filter(prop => {
                const rawValue = props.formValues[prop.propId];
                return !prop.isAutomatic && rawValue !== undefined && rawValue !== null && rawValue.toString().trim() !== '';
            })
            .map(prop => ({
                value: props.formValues[prop.propId].toString().trim(),
                propId: prop.propId,
                propertytype: prop.propertytype
            }));

        const isFileRequired = props.selectedObjectId === 0 && !props.templateIsTrue && !props.uploadedFile;
        if (isFileRequired) {
            alert('File upload is required.');
            setOpenAlert(true);
            setAlertSeverity('error');
            setAlertMsg('File upload is required.');
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || isFileRequired) {
            setFormErrors(newFormErrors);
            return;
        }

        setMiniLoader(true);

        const basePayload = {
            objectTypeID: props.selectedObjectId,
            classID:      props.selectedClassId,
            properties:   propertiesPayload,
            vaultGuid:    props.selectedVault.guid,
            objectID:     props.selectedTemplate?.id || props.selectedObjectId,
            userID:       parseInt(props.mfilesId, 10)
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
            setAlertSeverity('success');
            setAlertMsg('Created successfully');
            closeFormDialog();

            // Remove the matching 'opening' bg task (if this form was triggered by one)
            setBgTasks(prev => prev.filter(t => t.status !== 'opening'));

            if (pendingFilesQueue.length > 0) {
                const [nextFile, ...rest] = pendingFilesQueue;
                setPendingFilesQueue(rest);
                props.setUploadedFile(nextFile);
                props.setIsDataOpen(true);
            } else {
                // Pop next completed bg task if any
                setTimeout(() => {
                    setBgTasks(prev => {
                        const next = prev.find(t => t.status === 'done');
                        if (next) {
                            applyBgTaskResult(next);
                            return prev.map(t => t.id === next.id ? { ...t, status: 'opening' } : t);
                        }
                        return prev;
                    });
                }, 400);

                props.closeModal();
                setTimeout(() => {
                    props.getRecent?.();
                    props.getAssigned?.();
                }, 10000);
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            setMiniLoader(false);
            setOpenAlert(true);
            setAlertSeverity('error');
            setAlertMsg('Error submitting form.', error);
        }
    }, [filteredProperties, props, closeFormDialog, pendingFilesQueue, applyBgTaskResult]);

    const handleSubmitVObject = useCallback(async () => {
        const newFormErrors = {};
        const propertiesPayload = filteredVLProperties
            .filter(prop => VLformValues[prop.propId] !== undefined && VLformValues[prop.propId] !== '' && !prop.isAutomatic)
            .map(prop => ({ value: `${VLformValues[prop.propId]}`, propId: prop.propId, propertytype: prop.propertytype }));

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
            classID:      valueListClassId,
            properties:   propertiesPayload,
            vaultGuid:    props.selectedVault.guid,
            objectID:     valueListObjectId,
            userID:       parseInt(props.mfilesId, 10)
        };

        try {
            await axios.post(`${constants.mfiles_api}/api/objectinstance/ObjectCreation`, basePayload, { headers: { 'Content-Type': 'application/json', accept: '*/*' } });
            setMiniLoaderVL(false);
            setOpenAlert(true);
            setAlertSeverity('success');
            setAlertMsg('Value list object created successfully');
            handleValueListSuccess();
        } catch (error) {
            console.error('Error submitting VL form:', error);
            setMiniLoaderVL(false);
            setOpenAlert(true);
            setAlertSeverity('error');
            setAlertMsg('Error creating value list object. Please try again.');
        }
    }, [filteredVLProperties, VLformValues, valueListObjectId, valueListClassId, props.selectedVault?.guid, props.mfilesId, handleValueListSuccess]);

    const handleSearchTermChange = useCallback((event) => { setSearchTerm(event.target.value); }, []);
    const handleSearchChange     = useCallback((event) => { setSearchQuery(event.target.value.toLowerCase()); }, []);

    const handleClassSelection = useCallback((classId, className, objectId) => {
        props.handleClassSelection(classId, className, objectId);
        setSearchQuery('');
    }, [props]);

    const handleAIClassSelect = useCallback(async (classId, aiProperties, objectId, remainingFiles = [], overrideFile = null) => {
        const resolvedObjectId = objectId ?? props.selectedObjectId;
        try {
            props.setIsLoading(true);
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${resolvedObjectId}/${classId}/${props.mfilesId}`
            );

            const aiValueMap = {};
            (aiProperties || []).forEach(({ propId, propertytype, value }) => {
                if (propertytype === 'MFDatatypeMultiSelectLookup') {
                    aiValueMap[propId] = value ? (Array.isArray(value) ? value : String(value).split(',').map(v => v.trim()).filter(Boolean)) : [];
                } else {
                    aiValueMap[propId] = value ?? '';
                }
            });

            const mergedValues = response.data.reduce((acc, prop) => {
                acc[prop.propId] = prop.propertytype === 'MFDatatypeMultiSelectLookup'
                    ? (aiValueMap[prop.propId] ?? [])
                    : (aiValueMap[prop.propId] ?? '');
                return acc;
            }, {});

            let resolvedClassName = '';
            props.groupedItems?.forEach(g => {
                const match = g.members.find(m => m.classId === classId);
                if (match) resolvedClassName = match.className;
            });
            if (!resolvedClassName) {
                const match = props.ungroupedItems?.find(m => m.classId === classId);
                if (match) resolvedClassName = match.className;
            }

            props.setFormProperties(response.data);
            props.setFormValues(mergedValues);
            props.setSelectedClassId(classId);
            props.setSelectedClassName(resolvedClassName);
            setFormErrors({});

            if (overrideFile) props.setUploadedFile(overrideFile);

            setPendingFilesQueue(remainingFiles || []);
            props.closeDataDialog();
            props.setIsFormOpen(true);
        } catch (err) {
            console.error('Error applying AI classification:', err);
            setOpenAlert(true);
            setAlertSeverity('error');
            setAlertMsg('AI classification could not load class properties. Please try again.');
        } finally {
            props.setIsLoading(false);
        }
    }, [props]);

    const handleClassChange = useCallback(async (classId, className, objectId) => {
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${objectId}/${classId}/${props.mfilesId}`
            );
            props.setFormProperties(response.data);
            props.setFormValues(response.data.reduce((acc, prop) => { acc[prop.propId] = ''; return acc; }, {}));
            setFormErrors({});
            props.setSelectedClassId(classId);
            props.setSelectedClassName(className);
        } catch (error) {
            console.error('Error fetching new class properties:', error);
            setOpenAlert(true);
            setAlertSeverity('error');
            setAlertMsg('Error loading class properties. Please try again.');
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
                ref={classSelectionRef}
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
                uploadedFile={props.uploadedFile}
                onFileChange={handleFileChange}
                fileUploadError={fileUploadError}
                mfilesId={props.mfilesId}
                selectedVault={props.selectedVault}
                onAIClassSelect={handleAIClassSelect}
                onFileQueueChange={(queue, idx) => {
                    const remaining = queue.filter((e, i) => i > idx && e.status === 'pending' && e.file != null);
                    setPendingFilesQueue(remaining.map(e => e.file));
                }}
                onEnqueueBackground={handleEnqueueBackground}
                setFileUploadError={setFileUploadError}
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
                onClose={handleFormClose}
                selectedObjectId={props.selectedObjectId}
                selectedClassName={props.selectedClassName}
                selectedClassId={props.selectedClassId}
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
                setAddingValueListItem={() => {}}
                onUseTemplate={props.UseTemplate}
                onDontUseTemplates={props.dontUseTemplates}
                groupedItems={props.groupedItems}
                ungroupedItems={props.ungroupedItems}
                onClassChange={handleClassChange}
                setOpenAlert={setOpenAlert}
                setAlertSeverity={setAlertSeverity}
                setAlertMsg={setAlertMsg}
                fileUploadError={fileUploadError}
                remainingFilesCount={pendingFilesQueue.length}
            />

            <ValueListObjectDialog
                open={valueListDialogOpen}
                onClose={() => { setValueListDialogOpen(false); setVLFormProperties([]); setVLFormValues({}); setVLFormErrors({}); }}
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

            {/* Floating background-task tracker */}
            <BackgroundTaskTracker
                tasks={bgTasks.filter(t => t.status !== 'opening')}
                onCloseAll={handleCloseAll}
                onDismissTask={handleDismissBgTask}
                onOpenTask={handleOpenBgTask}
            />
        </>
    );
};

export default NewObjectDialog;