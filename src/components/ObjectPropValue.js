import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as constants from './Auth/configs'


const ObjectPropValue = ({ vault, objectId, classId, propName }) => {
    const [value, setValue] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            
            try {
                
                const response = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${vault}/${objectId}/${classId}`);
                const foundItem = response.data.find(item => item.propName === propName);
                if (foundItem) {
                    
                    setValue(foundItem.value);
                } else {
                    setValue(null);
                }
            } catch (error) {
                setValue(null);
            }
        };

        fetchData();
    }, [vault, objectId, classId, propName]);

    return <span style={{color: '#1d3557'}} >{value} </span>;
};

export default ObjectPropValue;
