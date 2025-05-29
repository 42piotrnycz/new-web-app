import React from 'react';
import {Box, ToggleButton, ToggleButtonGroup} from '@mui/material';

const CONTENT_TYPES = ['All', 'movie', 'tvseries', 'game', 'book'];

/**
 * Content filter component for filtering reviews by content type
 */
const ContentFilter = ({selectedType, onTypeChange, contentTypes = CONTENT_TYPES}) => {
    return (
        <Box sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            overflow: 'auto'
        }}>
            <ToggleButtonGroup
                value={selectedType}
                exclusive
                onChange={onTypeChange}
                aria-label="content type"
                color="primary"
                sx={{
                    flexWrap: {xs: 'nowrap', md: 'wrap'},
                    '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        px: {xs: 2, sm: 3},
                        minWidth: {xs: 'auto', sm: 'auto'},
                        fontSize: {xs: '0.8rem', sm: '0.875rem'}
                    }
                }}
            >
                {contentTypes.map((type) => (
                    <ToggleButton
                        key={type}
                        value={type}
                    >
                        {type}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
};

export default ContentFilter;
