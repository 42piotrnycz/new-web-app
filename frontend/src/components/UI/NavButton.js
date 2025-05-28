import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * Navigation button component
 * @param {Object} props
 * @param {string} props.to
 * @param {Function} props.onClick
 * @param {string} props.color
 * @param {Object} props.sx
 * @param {React.ReactNode} props.children
 * @param {boolean} props.isAdmin
 * @returns {JSX.Element} 
 */
const NavButton = ({ to, onClick, color = 'inherit', sx = {}, children, isAdmin = false }) => {
    const baseStyles = {
        px: { xs: 1, sm: 2 },
        py: { xs: 0.5, sm: 1 },
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        minWidth: 'auto',
        whiteSpace: 'nowrap',
        ...sx
    };

    const adminStyles = isAdmin ? {
        backgroundColor: 'error.main',
        '&:hover': {
            backgroundColor: 'error.dark',
        }
    } : {};

    const combinedStyles = {
        ...baseStyles,
        ...adminStyles
    };

    // If "to" prop is provided, render as a Link, otherwise as a regular button
    return to ? (
        <Button
            color={color}
            component={Link}
            to={to}
            sx={combinedStyles}
        >
            {children}
        </Button>
    ) : (
        <Button
            color={color}
            onClick={onClick}
            sx={combinedStyles}
        >
            {children}
        </Button>
    );
};

export default NavButton;
