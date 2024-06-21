import React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

class DownloadCSV extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            csvData: "email,first_name,last_name,password" // Include the 'password' field in the CSV data template
        };
    }

    downloadCSV = () => {
        const blob = new Blob([this.state.csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    render() {
        return (
            <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={this.downloadCSV}
                style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}
                className='my-3'
            >
                Download CSV Template
            </Button>
        );
    }
}

export default DownloadCSV;
