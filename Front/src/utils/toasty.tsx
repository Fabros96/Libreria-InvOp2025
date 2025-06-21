// src/utils/toastService.js
import { toast, type TypeOptions } from 'react-toastify';


export const showToasty = (mensaje: string, type: TypeOptions) => {
    const temaGuardado = localStorage.getItem('tema');
    // let theme = 'light';

    // // if (temaGuardado === 'oscuro') {
    // //     theme = 'light';
    // // } else if (temaGuardado === 'claro') {
    // //     theme = 'dark';
    // // }

    toast(mensaje, {
        position: 'top-center',
        type: type,       // 'info', 'success', 'warning', 'error', 'default'
        // theme: theme,     
        theme: 'colored',     
        autoClose: 5000,
        closeButton: true,
        style: { color: temaGuardado === 'claro' ? 'var(--texto)' : 'var(--secundario)' }

    });
}
