import axios from 'axios';

async function getObjectPropValue(props) {
    try {
      const response = await axios.get(`http://192.236.194.251:240/api/objectinstance/GetObjectViewProps/${props.vault}/${props.objectId}/${props.classId} `);
        for (let item of response.data) {
                if (item.propName === props.propName) {
                    return item.value;
                }
            }
        return null;

    } catch (error) {
      return null
    }
}

export default getObjectPropValue;