import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faFolderOpen,
    faTasks,
    faChartBar,
    faUser,
    faHandPointer,
    faCar,
    faFile,
    faFolder,
    faUserFriends,
    faPlus,
    faTag
} from '@fortawesome/free-solid-svg-icons';

const allIcons = {
    faFileAlt,
    faFolderOpen,
    faTasks,
    faChartBar,
    faUser,
    faCar,
    faFile,
    faFolder,
    faUserFriends,
};

const GetIcon = ({ name }) => {
    const nameWords = name.toLowerCase().split(' ');

    for (let iconName in allIcons) {
        for (let word of nameWords) {
            if (iconName.toLowerCase().includes(word)) {
                return <FontAwesomeIcon icon={allIcons[iconName]} />;
            }
            if (word.toLowerCase().includes('document') || word.toLowerCase().includes('invoice') || word.toLowerCase().includes('petty cash')) {
                return <FontAwesomeIcon icon={faFile} />;
            }
            if (word.toLowerCase().includes('staff') || word.toLowerCase().includes('employee')) {
                return <FontAwesomeIcon icon={faUser} />;
            }
            if (word.toLowerCase().includes('Car')){
                return <FontAwesomeIcon icon={faCar} />;
            }
        }
    }
    return <FontAwesomeIcon icon={faFolder} />;
};

export default GetIcon;
