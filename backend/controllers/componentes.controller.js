const { ejecutarConsulta } = require('../services/db');

const obtenerComponentes = async (req, res) => {
    try {
        const query = 'SELECT * FROM Componentes';
        const resultados = await ejecutarConsulta(query);
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener componentes:', error);
        res.status(500).json({ error: 'Error al obtener componentes' });
    }
};
const agregarComponente = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const query = 'INSERT INTO Componentes (Nombre, Descripcion) VALUES (?, ?)';
        await ejecutarConsulta(query, [nombre, descripcion]);
        res.status(201).json({ message: 'Componente agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar componente:', error);
        res.status(500).json({ error: 'Error al agregar componente' });
    }
};
const obtenerTiposComponentes = async (req, res) => {
    try {
        const query = 'SELECT * FROM Tipo_Componentes';
        const resultados = await ejecutarConsulta(query);
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener tipos de componentes:', error);
        res.status(500).json({ error: 'Error al obtener tipos de componentes' });
    }
};

module.exports = {
    obtenerComponentes,
    agregarComponente,
    obtenerTiposComponentes
};
