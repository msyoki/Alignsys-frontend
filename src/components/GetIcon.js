import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt,faFolderOpen, faTasks, faChartBar, faUser, faHandPointer, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect } from 'react'

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

function GetIcon({name}) {
    const nameWords = name.toLowerCase().split(' ');

    for (let iconName in allIcons) {
        for (let word of nameWords) {
            if (iconName.toLowerCase().includes(word)) {
                return allIcons[iconName];
            }
            if (word.toLowerCase().includes('document') || word.toLowerCase().includes('invoice') || word.toLowerCase().includes('Petty Cash')) {
                return faFile;
            }

            if (word.toLowerCase().includes('staff') || word.toLowerCase().includes('employee')) {
                return faUser;
            }
        }
    }
    return faFolder;
}

export default GetIcon