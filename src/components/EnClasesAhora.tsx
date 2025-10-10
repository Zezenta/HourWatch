
import React, { useState, useEffect } from 'react';

interface Clase {
  dia: string;
  materia: string;
  horaInicio: string;
  horaFin: string;
  profesor: string | null;
  aula: string | null;
}

interface Horario {
  nombre: string;
  color: string;
  clases: Clase[];
}

interface EnClasesAhoraProps {
  horarios: Horario[];
}

const EnClasesAhora: React.FC<EnClasesAhoraProps> = ({ horarios }) => {
  const [enClases, setEnClases] = useState<string[]>([]);

  useEffect(() => {
    const updateEnClases = () => {
      const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const ahora = new Date();
      const diaActual = diasSemana[ahora.getDay()];
      const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');

      const personasEnClase: string[] = [];

      horarios.forEach(horario => {
        horario.clases.forEach(clase => {
          if (clase.dia === diaActual && clase.horaInicio <= horaActual && clase.horaFin > horaActual) {
            personasEnClase.push(horario.nombre);
          }
        });
      });

      setEnClases(personasEnClase);
    };

    updateEnClases();

    const interval = setInterval(updateEnClases, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [horarios]);

  if (enClases.length === 0) {
    return null;
  }

  return (
    <div className="text-center text-sm mb-2">
      <span className="font-bold">En clases ahora: </span>
      <span>{enClases.join(', ')}</span>
    </div>
  );
};

export default EnClasesAhora;
