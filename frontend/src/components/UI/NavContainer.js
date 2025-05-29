import React from 'react';
import {Box} from '@mui/material';

/**
 * Container component for navigation buttons
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.sx
 * @returns {JSX.Element}
 */
const NavContainer = ({children, sx = {}}) => {

    const baseStyles = {
        display: 'flex',
        gap: {xs: 0.5, sm: 1},
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflow: 'auto',
        mr: {xs: 1, sm: 2},
        pr: {xs: 2, sm: 3},
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
            display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
        ...sx
    };

    return (
        <Box sx={baseStyles}>
            {children}
        </Box>
    );
};

export default NavContainer;
