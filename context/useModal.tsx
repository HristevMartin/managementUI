'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ModalContext = createContext({
    showModal: (status: string, message: string): void => { }
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: any) => {
    const [isVisible, setIsVisible] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalStatus, setModalStatus] = useState('success');
    const [isClient, setIsClient] = useState(false);

    const showModal = (status: string, message: string) => {
        setModalContent(message);
        setModalStatus(status);
        setIsVisible(true);

        setTimeout(() => {
            setIsVisible(false);
        }, 3000);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    console.log('show me its visible', isVisible)

    const modalStyle = {
        display: isVisible ? 'block' : 'none',
        position: 'fixed',
        top: '10px',
        right: '20px',
        backgroundColor: modalStatus === 'success' ? '#D4EDDA' : '#F8D7DA',
        color: modalStatus === 'success' ? '#155724' : '#721C24',
        padding: '20px',
        borderRadius: '4px',
        zIndex: 2000
    };

    return (
        <ModalContext.Provider value={{ showModal }}>
            {children}
            {isClient && isVisible && (
                <div style={modalStyle}>
                    {modalContent}
                </div>
            )}
        </ModalContext.Provider>
    );
};
