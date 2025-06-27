// src/utils/toastService.js
import { toast, type TypeOptions } from 'react-toastify';


export const showToasty = (mensaje: string, type: TypeOptions) => {
    const temaGuardado = localStorage.getItem('tema');


    toast(mensaje, {
        position: 'top-center',
        type: type,       // 'info', 'success', 'warning', 'error', 'default'
        // theme: theme,     
        theme: 'colored',     
        autoClose: 5000,
        closeButton: true,
        style: { color: temaGuardado === 'claro' ? 'var(--texto)' : (type === 'success' ? 'var(--detalles)' : 'var(--secundario)') },

    });
}
