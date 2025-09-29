import React from 'react';

interface Horario {
  nombre: string;
  color: string;
}

interface FilterProps {
  horarios: Horario[];
  selectedHorarios: string[];
  setSelectedHorarios: (selected: string[]) => void;
}

const Filter: React.FC<FilterProps> = ({ horarios, selectedHorarios, setSelectedHorarios }) => {
  const handleCheckboxChange = (nombre: string) => {
    if (selectedHorarios.includes(nombre)) {
      setSelectedHorarios(selectedHorarios.filter(item => item !== nombre));
    } else {
      setSelectedHorarios([...selectedHorarios, nombre]);
    }
  };

  return (
    <div className="p-2 bg-gray-800 rounded-md text-xs">
      <h2 className="font-bold mb-1 text-gray-200">Filtrar por nombre:</h2>
      <div className="flex flex-wrap gap-2">
        {horarios.map(horario => (
          <div key={horario.nombre} className="flex items-center">
            <input
              type="checkbox"
              id={horario.nombre}
              checked={selectedHorarios.includes(horario.nombre)}
              onChange={() => handleCheckboxChange(horario.nombre)}
              className="mr-1 h-3 w-3 rounded bg-gray-700 border-gray-600 focus:ring-blue-600"
            />
            <label htmlFor={horario.nombre} style={{ color: horario.color }}>
              {horario.nombre}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;