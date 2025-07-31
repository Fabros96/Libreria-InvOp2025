let mensajesCron: string[] = [];

export const agregarMensajeCron = (msg: string) => {
  //console.log("desde el cron-mensajes.service: ",msg)
  mensajesCron.push(msg);
};

export const obtenerMensajesCron = () => {
  //console.log("obtengoMensajes: ",mensajesCron)
  return mensajesCron;
};

export const limpiarMensajesCron = () => {
  mensajesCron = [];
};
