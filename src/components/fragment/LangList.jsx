import React, { useContext, useEffect, useMemo } from 'react';
import '../assets/scss/LangList.scss';
import Button from "@material-ui/core/Button";
import { ThemeContext } from "../../api/Theme";

function LangList({ item, isSelected, onClick }) {
    const useStyle = useContext(ThemeContext);
    
    // ✅ Оптимизируем hoverStyle с useMemo
    const hoverStyle = useMemo(() => useStyle?.button?.onHover || {}, [useStyle]);

    useEffect(() => {
        // Здесь можно добавить логику, если нужно
    }, [isSelected, hoverStyle]); 

    return (
        <Button 
            style={{
                backgroundColor: isSelected ? "var(--selected-bg)" : "var(--default-bg)",
                color: isSelected ? "var(--selected-text)" : "var(--default-text)",
                border: isSelected ? "2px solid var(--border-selected)" : "1px solid var(--border-color)"
            }} 
            onClick={(e) => {
                e.stopPropagation();  // ✅ Останавливаем всплытие, чтобы dropdown не закрывался
                onClick(item);
            }}  
        >
            {item}
        </Button>
    );
}

export default LangList;
