import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useFormularioLogic = () => {
  const [formData, setFormData] = useState({ requerimiento: '', usuario: '', tecnico: '', equipo: '', codigoBarras: '', comentario: '', });
  const [usuarios, setUsuarios] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState({ usuario: false, tecnico: false, equipo: false });
  const [usuariosEquipos, setUsuariosEquipos] = useState({});

  const usuarioRef = useRef(null);
  const tecnicoRef = useRef(null);
  const equipoRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUsuarios, resTecnicos, resEquipos] = await Promise.all([
          axios.get('http://172.20.70.113:3000/api/usuarios'),
          axios.get('http://172.20.70.113:3000/api/tecnicos'),
          axios.get('http://172.20.70.113:3000/api/equipos')
        ]);

        const usuariosData = resUsuarios.data;
        console.log('Ejemplo de usuario:', usuariosData[0]);
        const equiposData = resEquipos.data;
        console.log('Ejemplo de equipo:', equiposData[0]);
        // Guarda los nombres para autocompletado
        setUsuarios(usuariosData.map(u => u.NOMBRE || u.nombre || ''));

        // Crea el mapa usuario → equipo
        const mapaUsuariosEquipos = {};
        usuariosData.forEach(u => {
          const nombre = u.NOMBRE || u.nombre;
          const equipo = u.EQUIPO || u.equipo || u.nom_equipo;
          if (nombre && equipo) {
            mapaUsuariosEquipos[nombre] = equipo;
          }
        });

        setUsuariosEquipos(mapaUsuariosEquipos);
        console.log('Mapa usuario → equipo:', mapaUsuariosEquipos);

        setTecnicos(resTecnicos.data.map(t => t.NOM_TECNICO || ''));
        setEquipos(resEquipos.data.map(e => e.NOM_EQUIPO || e.nom_equipo || ''));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  return {
    formData, setFormData,
    usuarios, tecnicos, equipos,
    showSuggestions, setShowSuggestions,
    usuarioRef, tecnicoRef, equipoRef,
    usuariosEquipos // <-- nuevo

  };

};

/*   useEffect(() => {
 
 
    const fetchData = async () => {
      try {
        const [resUsuarios, resTecnicos, resEquipos] = await Promise.all([
          axios.get('http://172.20.70.113:3000/api/usuarios'),
          axios.get('http://172.20.70.113:3000/api/tecnicos'),
          axios.get('http://172.20.70.113:3000/api/equipos')
        ]);
        setUsuarios(resUsuarios.data.map(u => u.NOMBRE || u.nombre || ''));
        setTecnicos(resTecnicos.data.map(t => t.NOM_TECNICO || ''));
        setEquipos(resEquipos.data.map(e => e.NOM_EQUIPO || e.nom_equipo || ''));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    fetchData();
  }, []);
 */
