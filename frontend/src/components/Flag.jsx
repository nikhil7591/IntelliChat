import React, { useState } from 'react';

const Flag = ({ countryCode, className = "", size = "1em" }) => {
    const [imageError, setImageError] = useState(false);
    
    // Use flag images from CDN for better compatibility
    const getFlagUrl = (code) => {
        return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
    };

    // Fallback to emoji if image fails
    const getFlagEmoji = (code) => {
        const codePoints = code
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    if (imageError) {
        return (
            <span 
                className={className}
                style={{ 
                    fontSize: size,
                    display: 'inline-block',
                    lineHeight: 1
                }}
                role="img"
                aria-label={`Flag of ${countryCode}`}
            >
                {getFlagEmoji(countryCode)}
            </span>
        );
    }

    return (
        <img 
            src={getFlagUrl(countryCode)}
            alt={`Flag of ${countryCode}`}
            className={className}
            style={{
                width: size,
                height: 'auto',
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
            onError={handleImageError}
        />
    );
};

export default Flag;
