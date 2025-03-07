<>
    <Box sx={{ display: 'flex', flexDirection: 'row' }} className='bg-white'>
        <Tabs
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Horizontal tabs example"
            sx={{ borderColor: 'divider' }}
            className='bg-white'
        >
            <Tab
                style={{ textTransform: 'none' }}
                label="Metadata"
                {...a11yProps(0)}
            />
            <Tab
                style={{ textTransform: 'none' }}
                label="Preview"
                {...a11yProps(1)}
            />
            <Tab
                style={{ textTransform: 'none' }}
                label="AI Chatbot"
                {...a11yProps(2)}
            />
            <Tab
                style={{ textTransform: 'none' }}
                label="Comments"
                {...a11yProps(3)}
            />
        </Tabs>
    </Box>

    <Box sx={{ flexGrow: 1, margin: 0, color: '#555' }} >
        <CustomTabPanel
            value={value}
            index={0}
            style={{
                backgroundColor: '#e5e5e5',
                height: '90vh',
                padding: '0%',
                width: '100%',
                overflowY: 'auto'
            }}
        >

        </CustomTabPanel>

        <CustomTabPanel
            value={value}
            index={1}
            style={{
                backgroundColor: '#e5e5e5',
                height: '100%',
                padding: '0%',
                overflowY: 'clip',
                width: '100%'
            }}
        >

        </CustomTabPanel>

        <CustomTabPanel
            value={value}
            index={2}
            style={{
                backgroundColor: '#e5e5e5',
                height: '90vh',
                padding: '0%',
                width: '100%'
            }}
        >

        </CustomTabPanel>

        <CustomTabPanel
            value={value}
            index={3}
            style={{
                backgroundColor: '#e5e5e5',
                height: '90vh',
                padding: '0%',
                width: '100%'
            }}
        >

        </CustomTabPanel>
    </Box>
</>