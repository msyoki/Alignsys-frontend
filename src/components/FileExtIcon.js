import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as constants from './Auth/configs';
import { FaRegFilePdf } from "react-icons/fa6";
import { BsFiletypeCsv } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa6";
import { BsFiletypeTxt } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa";
import { FaInternetExplorer } from "react-icons/fa";
import { BsFiletypePptx } from "react-icons/bs";
import { VscVscode } from "react-icons/vsc";
import { CiFileOn } from "react-icons/ci";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { CiImageOn } from "react-icons/ci";
import { HiOutlineAnnotation } from "react-icons/hi";

const FileExtIcon = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [is400, setIs400] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchExtension = async () => {
      setLoading(true);
      setIs400(false);

      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;

      try {
        const response = await axios.get(url, { signal: controller.signal });
        const data = response.data;
        const ext = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        if (isMounted) {
          setExtension(ext);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response && err.response.status === 400) {
          if (isMounted) {
            setIs400(true);
          }
        } else if (!axios.isCancel(err)) {
          console.error('Error fetching the extension:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExtension();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [props.guid, props.objectId, props.classId, props.version ?? null]); // Removed props.isMultifile as it's not used

  const iconStyle = {
    fontSize: props.fontSize || '15px',
  };

  if (loading) {
    // Show grey file icon while loading
    return <i className="fas fa-file" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
  }

  if (is400) {
    // Show book icon if 400 error
    return <i className="fas fa-file" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
  }

  // Render icons based on extension
  switch (extension) {
    case 'pdf':
      return <FaRegFilePdf style={{ ...iconStyle, color: '#f21b3f' }} />;
    case 'csv':
      return <BsFiletypeCsv style={{ ...iconStyle, color: '#7cb518' }} />;
    case 'txt':
      return <BsFiletypeTxt style={{ ...iconStyle, color: '#555b6e' }} />;
    case 'msg':
      return <FaEnvelope style={{ ...iconStyle, color: '#ffb703' }} />;
    case 'webp':
      return <FaInternetExplorer style={{ ...iconStyle, color: '#2757aa' }} />;
    case 'xlsx':
    case 'xls':
      return <PiMicrosoftExcelLogoFill style={{ ...iconStyle, color: '#217045' }} />;
    case 'ppt':
    case 'pptx':
      return <BsFiletypePptx style={{ ...iconStyle, color: '#d34628' }} />;
    case 'docx':
    case 'doc':
      return <FaRegFileWord style={{ ...iconStyle, color: '#35558b' }} />;
    case 'png':
    case 'jpeg':
    case 'jpg':
      return <CiImageOn style={{ ...iconStyle, color: '#2a68af' }} />;
    case 'xfdf':
      return <HiOutlineAnnotation style={{ ...iconStyle, color: '#ffb703' }} />;
    case 'vssettings':
      return <VscVscode style={{ ...iconStyle, color: '#555b6e' }} />;
    default:
      return <CiFileOn style={{ ...iconStyle, color: '#e5e5e5' }} />;
  }
};

export default FileExtIcon;