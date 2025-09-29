import React, { useState, useEffect } from 'react';
import horariosData from '../horarios.json';
import Filter from './Filter';

// Define interfaces for type safety
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

// Define a more specific type for a class instance in the schedule
type ScheduleClass = Clase & { nombre: string; color: string };

const Schedule: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
  const [showColorEditor, setShowColorEditor] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ScheduleClass | null>(null);

  // On initial mount, load schedule from JSON and merge with saved color preferences
  useEffect(() => {
    const colorPreferences = JSON.parse(localStorage.getItem('colorPreferences') || '{}');
    const initialHorarios = horariosData.map(horario => ({
      ...horario,
      color: colorPreferences[horario.nombre] || horario.color,
    }));
    setHorarios(initialHorarios);
    setSelectedHorarios(initialHorarios.map((h: Horario) => h.nombre));
  }, []);

  // Persist only color preferences to localStorage whenever horarios state changes
  useEffect(() => {
    if (horarios.length > 0) {
      const colorPreferences = horarios.reduce((acc, horario) => {
        acc[horario.nombre] = horario.color;
        return acc;
      }, {} as { [key: string]: string });
      localStorage.setItem('colorPreferences', JSON.stringify(colorPreferences));
    }
  }, [horarios]);

  const handleColorChange = (nombre: string, color: string) => {
    const newHorarios = horarios.map(h =>
      h.nombre === nombre ? { ...h, color } : h
    );
    setHorarios(newHorarios);
  };

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const horas = Array.from({ length: 15 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

  const filteredHorarios = horarios.filter(h => selectedHorarios.includes(h.nombre));

  return (
    <div className="container mx-auto p-2 text-xs bg-gray-900 text-gray-200 min-h-screen">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Horario de Clases</h1>
        <button
          onClick={() => setShowColorEditor(!showColorEditor)}
          className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
        >
          {showColorEditor ? 'Ocultar Editor' : 'Editar Colores'}
        </button>
      </div>

      <div className="mb-2">
        <Filter
          horarios={horarios}
          selectedHorarios={selectedHorarios}
          setSelectedHorarios={setSelectedHorarios}
        />
      </div>

      {showColorEditor && (
        <div className="flex flex-wrap items-center gap-4 my-2 p-2 bg-gray-800 rounded-md">
          <h3 className="font-bold text-xs">Editar Colores:</h3>
          {horarios.map(horario => (
            <div key={horario.nombre} className="flex items-center gap-2">
              <label htmlFor={`${horario.nombre}-color`} className="font-medium" style={{ color: horario.color }}>
                {horario.nombre}
              </label>
              <input
                type="color"
                id={`${horario.nombre}-color`}
                value={horario.color}
                onChange={(e) => handleColorChange(horario.nombre, e.target.value)}
                className="w-8 h-8 bg-transparent"
              />
            </div>
          ))}
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-md text-gray-200 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold mb-2" style={{ color: selectedClass.color }}>{selectedClass.materia}</h2>
            <p><span className="font-bold">Persona:</span> {selectedClass.nombre}</p>
            <p><span className="font-bold">Día:</span> {selectedClass.dia}</p>
            <p><span className="font-bold">Hora:</span> {selectedClass.horaInicio} - {selectedClass.horaFin}</p>
            {selectedClass.profesor && <p><span className="font-bold">Profesor:</span> {selectedClass.profesor}</p>}
            {selectedClass.aula && <p><span className="font-bold">Aula:</span> {selectedClass.aula}</p>}
            <button
              onClick={() => setSelectedClass(null)}
              className="mt-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        <div className="font-bold text-center">Hora</div>
        {dias.map(dia => (
          <div key={dia} className="font-bold text-center">{dia}</div>
        ))}
        {horas.map(hora => (
          <React.Fragment key={hora}>
            <div className="font-bold text-center">{hora}</div>
            {dias.map(dia => {
              const classesInSlot: ScheduleClass[] = filteredHorarios.flatMap(horario =>
                horario.clases
                  .filter(clase => clase.dia === dia && clase.horaInicio <= hora && clase.horaFin > hora)
                  .map(clase => ({ ...clase, nombre: horario.nombre, color: horario.color }))
              );

              const numClasses = classesInSlot.length;
              let gridLayoutClasses = 'grid-cols-1 grid-rows-1';
              let fontSizeClass = 'text-[8px] sm:text-xs';

              if (numClasses === 2) {
                gridLayoutClasses = 'grid-cols-2 grid-rows-1';
              } else if (numClasses >= 3 && numClasses <= 4) {
                gridLayoutClasses = 'grid-cols-2 grid-rows-2';
                fontSizeClass = 'text-[7px] sm:text-[10px]';
              } else if (numClasses >= 5 && numClasses <= 6) {
                gridLayoutClasses = 'grid-cols-3 grid-rows-2';
                fontSizeClass = 'text-[6px] sm:text-[8px]';
              } else if (numClasses > 6) {
                gridLayoutClasses = 'grid-cols-3 grid-rows-3';
                fontSizeClass = 'text-[5px] sm:text-[6px]';
              }

              return (
                <div key={`${dia}-${hora}`} className="border border-gray-700 rounded-md p-0.5 h-16">
                  <div className={`grid ${gridLayoutClasses} gap-0.5 h-full`}>
                    {classesInSlot.map((clase, index) => (
                      <div
                        key={`${clase.nombre}-${clase.materia}-${index}`}
                        onClick={() => setSelectedClass(clase)}
                        className="rounded-sm p-0.5 text-white flex items-center justify-center text-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: clase.color }}
                      >
                        <p className={`font-bold ${fontSizeClass} leading-tight break-normal`}>{clase.materia}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
