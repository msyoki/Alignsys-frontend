import React, { useState, useContext } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import * as constants from './Auth/configs';
import { CircularProgress } from '@mui/material';
import AddSignersDialog from './Modals/AddSigners';
import TimedAlert from './TimedAlert';
import Authcontext from './Auth/Authprovider';

export default function SignOptions(props) {
    const { user } = useContext(Authcontext);
    const [signers, setSigners] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialogAddSigners, setOpenDialogAddSigners] = useState(false);

    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [alertMsg, setAlertMsg] = useState("");

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const postData = async () => {
        setLoading(true);
        try {
            const url = `${constants.mfiles_api}/api/objectinstance/DSSPostObjectFile`;

            const data = {
                objectid: props.objectid,
                classId: props.classid,
                fileid: props.fileId,
                vaultGuid: props.vault,
                signerEmail: props.email,
                userID: props.mfilesId,
            };
            console.log(data);

            const headers = {
                accept: '*/*',
                'Content-Type': 'application/json',
            };

            const response = await axios.post(url, data, { headers });
            console.log('Response:', response.data);

            // Extract the filelink from the response and open it in a new tab
            const fileLink = response.data.filelink;
            if (fileLink) {
                window.open(fileLink, '_blank');
            } else {
                console.error('Error: filelink not found in response');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const postDataOthers = async () => {

        const emails = signers.map(item => item.email).join(",");
        console.log("Signer list:", emails);

        setLoading(true);
        try {
            const url = `${constants.mfiles_api}/api/objectinstance/DSSPostObjectFile`;

            const data = {
                objectid: props.objectid,
                classId: props.classid,
                fileid: props.fileId,
                vaultGuid: props.vault,
                signerEmail: `${emails}`,
                userID: props.mfilesId,
            };
            console.log(data);

            const headers = {
                accept: '*/*',
                'Content-Type': 'application/json',
            };

            const response = await axios.post(url, data, { headers });
            console.log('Response:', response.data);


            if (user.email === emails[0]) {

                // Extract the filelink from the response and open it in a new tab
                const fileLink = response.data.filelink;
                if (fileLink) {
                    window.open(fileLink, '_blank');
                } else {
                    console.error('Error: filelink not found in response');
                }
            } else {
                setOpenAlert(true);
                setAlertSeverity("success");
                setAlertMsg(`Document successfully sent for signing. to the signers ${emails}`);
            }



            setSigners([]);
        } catch (error) {
            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg(`Error sending document for signing. Please try again later.`);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <TimedAlert
                open={alertOpen}
                onClose={() => setOpenAlert(false)}
                severity={alertSeverity}
                message={alertMsg}
                setSeverity={setAlertSeverity}
                setMessage={setAlertMsg}
            />
            <AddSignersDialog
                // setAlertSeverity={setAlertSeverity} 
                // setAlertMsg={setAlertMsg} 
                // setOpenAlert={setOpenAlert} 
                // loading={loading} 
                // setLoading={setLoading} 
                // getWorkflows={getWorkflows} 
                // workflows={workflows} 
                // organizationWorkflows={organizationWorkflows} 
                opendialogaddsigners={openDialogAddSigners}
                setOpenDialogAddSigners={setOpenDialogAddSigners}
                signers={signers}
                setSigners={setSigners}
                postDataOthers={postDataOthers}
            // fileurl={uploadedfileurl} 
            // refreshdata={refreshdata} 
            // setUploadedFile={setUploadedFile} 
            // setActiveForm={setActiveForm} 
            />

            <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleClick}
                style={{ textTransform: 'none' }}
                disabled={loading} // disable button when loading
            >
                {loading && (
                    <CircularProgress
                        size={14}
                        color="inherit"
                        style={{ marginRight: 8 }}
                    />
                )}
                <small>
                    <i
                        className="fas fa-signature"
                        style={{ fontSize: '11px', marginRight: '4px' }}
                    ></i>
                    Sign Options
                </small>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem style={{ fontSize: '12.8px' }} onClick={postData}>
                    Sign Myself
                </MenuItem>
                <MenuItem style={{ fontSize: '12.8px' }} onClick={() => { setOpenDialogAddSigners(true) }}>
                    Mail Signers
                </MenuItem>

            </Menu>
        </div>
    );
}

