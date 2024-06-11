import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ObjectPropValue = ({ vault, objectId, classId, propName }) => {
    const [value, setValue] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            
            try {
                
                const response = await axios.get(`http://192.236.194.251:240/api/objectinstance/GetObjectViewProps/${vault}/${objectId}/${classId}`);
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

    return <span style={{color: '#2a68af'}} >{value} </span>;
};

export default ObjectPropValue;
