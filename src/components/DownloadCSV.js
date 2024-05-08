import React from 'react';

class DownloadCSV extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            csvData: "email,first_name,last_name\nuser1@example.com,John,Doe\nuser2@example.com,Jane,Smith\nuser3@example.com,Alice,Johnson"
        };
    }

    downloadCSV = () => {
        const blob = new Blob([this.state.csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    render() {
        return (

            <li onClick={this.downloadCSV} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3 btn' >
                <i className="fas fa-file-csv mx-2" style={{ fontSize: '1.5em' }}></i>
                <span className='list-text'>Bulk Registration CSV</span>
            </li>
        );
    }
}

export default DownloadCSV;
