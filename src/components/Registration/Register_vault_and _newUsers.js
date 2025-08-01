import React, { useState } from 'react';

const RegisterVaultUsersForm = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [vaultData, setVaultData] = useState({
        vault_id: '',
        vault_name: '',
        organization_id: ''
    });
    const [users, setUsers] = useState([
        { email: '', first_name: '', last_name: '', password: '' }
    ]);
    const [errors, setErrors] = useState({});
    const [response, setResponse] = useState(null);

    const handleVaultDataChange = (field, value) => {
        setVaultData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear field-specific error
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleUserChange = (index, field, value) => {
        const updatedUsers = [...users];
        updatedUsers[index][field] = value;
        setUsers(updatedUsers);

        // Clear user-specific error
        const errorKey = `user_${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const addUser = () => {
        setUsers([...users, { email: '', first_name: '', last_name: '', password: '' }]);
    };

    const removeUser = (index) => {
        if (users.length > 1) {
            const updatedUsers = users.filter((_, i) => i !== index);
            setUsers(updatedUsers);

            // Clear errors for removed user
            const newErrors = { ...errors };
            ['email', 'first_name', 'last_name', 'password'].forEach(field => {
                delete newErrors[`user_${index}_${field}`];
            });
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate vault data
        if (!vaultData.vault_id.trim()) newErrors.vault_id = 'Vault ID is required';
        if (!vaultData.vault_name.trim()) newErrors.vault_name = 'Vault name is required';
        if (!vaultData.organization_id.trim()) newErrors.organization_id = 'Organization ID is required';

        // Validate users
        users.forEach((user, index) => {
            if (!user.email.trim()) newErrors[`user_${index}_email`] = 'Email is required';
            if (!user.first_name.trim()) newErrors[`user_${index}_first_name`] = 'First name is required';
            if (!user.last_name.trim()) newErrors[`user_${index}_last_name`] = 'Last name is required';
            if (!user.password.trim()) newErrors[`user_${index}_password`] = 'Password is required';

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (user.email.trim() && !emailRegex.test(user.email)) {
                newErrors[`user_${index}_email`] = 'Invalid email format';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setResponse(null);

        const payload = {
            ...vaultData,
            organization_id: parseInt(vaultData.organization_id),
            users: users
        };

        try {
            // Replace with your actual API endpoint
            const response = await fetch('/api/register-vault-and-users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setResponse({ type: 'success', data });
                if (onSuccess) onSuccess(data);
            } else {
                setResponse({ type: 'error', data });
            }
        } catch (error) {
            setResponse({
                type: 'error',
                data: { error: 'Network error. Please try again.' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px',
            fontFamily: 'Roboto, Arial, sans-serif'
        },
        twoColumnLayout: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            alignItems: 'start'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '18px',
            fontWeight: '500',
            color: '#1976d2'
        },
        section: {
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#1976d2',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'left',
            gap: '6px'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            marginBottom: '8px'
        },
        formField: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginBottom: '8px'
        },
        formFieldFull: {
            gridColumn: '1 / -1'
        },
        label: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#333'
        },
        labelRequired: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#333'
        },
        input: {
            padding: '8px 10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '13px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none'
        },
        inputError: {
            borderColor: '#d32f2f'
        },
        inputFocus: {
            borderColor: '#1976d2',
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
        },
        errorText: {
            fontSize: '11px',
            color: '#d32f2f',
            marginTop: '2px'
        },
        usersHeader: {
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '8px'
        },
        addButton: {
            backgroundColor: 'transparent',
            color: '#1976d2',
            border: '1px solid #1976d2',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
        },
        userCard: {
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '8px',
            position: 'relative'
        },
        userHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
        },
        userTitle: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        removeButton: {
            backgroundColor: 'transparent',
            border: 'none',
            color: '#d32f2f',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
        },
        alert: {
            padding: '8px',
            borderRadius: '6px',
            marginTop: '8px',
            fontSize: '12px'
        },
        alertSuccess: {
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            border: '1px solid #c8e6c9'
        },
        alertError: {
            backgroundColor: '#ffeaea',
            color: '#d32f2f',
            border: '1px solid #ffcdd2'
        },
        chips: {
            display: 'flex',
            gap: '6px',
            marginTop: '6px',
            flexWrap: 'wrap'
        },
        chip: {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: '500'
        },
        chipSuccess: {
            backgroundColor: '#e8f5e8',
            color: '#2e7d32'
        },
        chipWarning: {
            backgroundColor: '#fff3e0',
            color: '#f57c00'
        },
        actions: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: '12px'
        },
        button: {
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        buttonText: {
            backgroundColor: 'transparent',
            color: '#1976d2'
        },
        buttonPrimary: {
            backgroundColor: '#1976d2',
            color: 'white'
        },
        buttonDisabled: {
            backgroundColor: '#ccc',
            cursor: 'not-allowed'
        },
        loading: {
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
        }
    };

    return (

        <div style={styles.container} className='row'>
            <div style={styles.header} >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
                </svg>
                Register Vault and Users
            </div>
            <div className='row'>
                {/* Vault Information Section */}
                <div style={styles.section} className='col-lg-6 col-md-12 col-sm-12'>
                    <div style={styles.sectionTitle}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
                        </svg>
                        Vault Information
                    </div>
                    <div style={styles.formGrid}>
                        <div style={styles.formField}>
                            <label style={styles.labelRequired}>
                                Vault ID (GUID) <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={vaultData.vault_id}
                                onChange={(e) => handleVaultDataChange('vault_id', e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={{
                                    ...styles.input,
                                    ...(errors.vault_id ? styles.inputError : {})
                                }}
                                placeholder="vault-guid-here"
                            />
                            {errors.vault_id && <div style={styles.errorText}>{errors.vault_id}</div>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.labelRequired}>
                                Organization ID <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input
                                type="number"
                                value={vaultData.organization_id}
                                onChange={(e) => handleVaultDataChange('organization_id', e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={{
                                    ...styles.input,
                                    ...(errors.organization_id ? styles.inputError : {})
                                }}
                                placeholder="1"
                            />
                            {errors.organization_id && <div style={styles.errorText}>{errors.organization_id}</div>}
                        </div>
                    </div>
                    <div style={{ ...styles.formField, ...styles.formFieldFull }}>
                        <label style={styles.labelRequired}>
                            Vault Name <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={vaultData.vault_name}
                            onChange={(e) => handleVaultDataChange('vault_name', e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                                ...styles.input,
                                ...(errors.vault_name ? styles.inputError : {})
                            }}
                            placeholder="Enter vault name"
                        />
                        {errors.vault_name && <div style={styles.errorText}>{errors.vault_name}</div>}
                    </div>
                </div>

                {/* Users Section */}
                <div style={styles.section} className='col-lg-6 col-md-12 col-sm-12'>
                    <div style={styles.usersHeader}>
                        <div style={styles.sectionTitle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Users ({users.length})
                        </div>
                        <button
                            type="button"
                            onClick={addUser}
                            style={styles.addButton}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1976d2';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#1976d2';
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Add User
                        </button>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {users.map((user, index) => (
                            <div key={index} style={styles.userCard}>
                                <div style={styles.userHeader}>
                                    <div style={styles.userTitle}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        User {index + 1}
                                    </div>
                                    {users.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeUser(index)}
                                            style={styles.removeButton}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(211, 47, 47, 0.1)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div style={styles.formGrid}>
                                    <div style={styles.formField}>
                                        <label style={styles.labelRequired}>
                                            First Name <span style={{ color: '#d32f2f' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={user.first_name}
                                            onChange={(e) => handleUserChange(index, 'first_name', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            style={{
                                                ...styles.input,
                                                ...(errors[`user_${index}_first_name`] ? styles.inputError : {})
                                            }}
                                        />
                                        {errors[`user_${index}_first_name`] &&
                                            <div style={styles.errorText}>{errors[`user_${index}_first_name`]}</div>
                                        }
                                    </div>
                                    <div style={styles.formField}>
                                        <label style={styles.labelRequired}>
                                            Last Name <span style={{ color: '#d32f2f' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={user.last_name}
                                            onChange={(e) => handleUserChange(index, 'last_name', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            style={{
                                                ...styles.input,
                                                ...(errors[`user_${index}_last_name`] ? styles.inputError : {})
                                            }}
                                        />
                                        {errors[`user_${index}_last_name`] &&
                                            <div style={styles.errorText}>{errors[`user_${index}_last_name`]}</div>
                                        }
                                    </div>
                                </div>

                                <div style={styles.formField}>
                                    <label style={styles.labelRequired}>
                                        Email <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        onChange={(e) => handleUserChange(index, 'email', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        style={{
                                            ...styles.input,
                                            ...(errors[`user_${index}_email`] ? styles.inputError : {})
                                        }}
                                    />
                                    {errors[`user_${index}_email`] &&
                                        <div style={styles.errorText}>{errors[`user_${index}_email`]}</div>
                                    }
                                </div>

                                <div style={styles.formField}>
                                    <label style={styles.labelRequired}>
                                        Password <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={user.password}
                                        onChange={(e) => handleUserChange(index, 'password', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        style={{
                                            ...styles.input,
                                            ...(errors[`user_${index}_password`] ? styles.inputError : {})
                                        }}
                                    />
                                    {errors[`user_${index}_password`] &&
                                        <div style={styles.errorText}>{errors[`user_${index}_password`]}</div>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Response Section */}
                    {response && (
                        <div style={{
                            ...styles.alert,
                            ...(response.type === 'success' ? styles.alertSuccess : styles.alertError)
                        }}>
                            {response.type === 'success' ? (
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                        {response.data.message}
                                    </div>
                                    <div style={styles.chips}>
                                        <div style={{ ...styles.chip, ...styles.chipSuccess }}>
                                            Created: {response.data.results?.created_users || 0}
                                        </div>
                                        <div style={styles.chip}>
                                            Updated: {response.data.results?.updated_users || 0}
                                        </div>
                                        {response.data.results?.errors > 0 && (
                                            <div style={{ ...styles.chip, ...styles.chipWarning }}>
                                                Errors: {response.data.results.errors}
                                            </div>
                                        )}
                                    </div>
                                    {response.data.error_details && (
                                        <div style={{ marginTop: '12px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Error Details:</div>
                                            {response.data.error_details.map((error, index) => (
                                                <div key={index}>• {error}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <strong>Error:</strong> {response.data.error || 'An error occurred'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div style={styles.actions}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...styles.buttonText
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : styles.buttonPrimary)
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1565c0')}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#1976d2')}
                >
                    {loading ? (
                        <>
                            <div style={styles.loading}></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
                            </svg>
                            Register Vault & Users
                        </>
                    )}
                </button>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>

    );
};

export default RegisterVaultUsersForm;