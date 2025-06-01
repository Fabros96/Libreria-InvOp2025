export const calculateDailyIntervalsBetweenDates = (fechaDesde: Date, fechaHasta: Date): number[] => {
  const delays = [];
  let i = 1;
  const timeFechaDesde = fechaDesde.getTime();
  const timeFechaHasta = fechaHasta.getTime();
  const now = new Date().getTime();
  let currentMilis = timeFechaDesde - now;
  if (timeFechaDesde == timeFechaHasta) {
    delays.push(currentMilis);
  } else {
    const finalMilis = timeFechaHasta - now;
    delays.push(currentMilis);
    i +=1; 
    while (currentMilis <= finalMilis) {
      currentMilis = (timeFechaDesde + (i * 86400000)) - now;
      delays.push(currentMilis);
      i +=1;
    }
  }
  return delays;
};

// 86400000 1 dia.

export const calculateDailyIntervalsRepetition = (fechaDesde: Date, repeticiones: number, value: number): any => {
  try {
    const delays: any = [];
    let i = 1;
    let timeFechaDesde = new Date(fechaDesde).getTime();
    const now = new Date().getTime();
    let currentMilis = 0;
    if (now < timeFechaDesde) {
      currentMilis = timeFechaDesde - now;
      delays.push(currentMilis);
      repeticiones = repeticiones - 1;
    }
    for (let index = 0; index < repeticiones; index++) {
      currentMilis += value;
      delays.push(currentMilis);
      i +=1;
    }
    return delays;
  } catch (error) {
    console.log('error ', error);
  }
};


  // nombre: 'Diario', valor: 86400000,
  // nombre: 'Semanal', valor: 604800000,
  // nombre: 'Mensual', valor: 2419200000,
  // nombre: '12hs', valor: 43200000,
  // nombre: '8hs', valor: 28800000,
  // nombre: '6hs', valor: 21600000,
  // nombre: '2hs', valor: 7200000,