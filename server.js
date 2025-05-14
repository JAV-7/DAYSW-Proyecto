// STARTING FILE FOR SERVER. TO RUN, TYPE 'node server.js' 
require('dotenv').config(); // Load environment variables first

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { authorizeRole } = require('./middleware/roles.middleware');
const { verifyToken } = require('./middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const Message = require('./models/message.model');
const Connection = require('./models/connection.model');
const setupSwagger = require("./config/swaggerConfig");

const app = express();
const server = http.createServer(app);
setupSwagger(app);

// Configuración de CORS más permisiva
const corsOptions = {
    origin: true, // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

//Multer
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Configuración de Socket.IO con CORS actualizado
const io = socketIO(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
});

app.use(express.json()); // to parse JSON from frontend

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos de public
app.use(express.static(path.join(__dirname, 'interfaces'))); // Servir archivos de interfaces
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Servir favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

// Middleware para manejar errores de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

mongoose.connect(process.env.MONGODB_URI, { // Basic MongoDB connection 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// ROUTES
const userRoutes = require('./routes/user.route');
const petRoutes = require('./routes/pet.route');
const adoptionRoutes = require('./routes/adoption.route');
const favoriteRoutes = require('./routes/favorite.route');

app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/favorites', favoriteRoutes);

// Rutas de páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Cambiar a index.html como página principal
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Almacenamiento temporal de mensajes y usuarios conectados
const messages = {};
const connectedUsers = new Map();

// Función para normalizar ID de usuario
function normalizeUserId(id) {
    return id ? id.toString() : id;
}

// Debug de usuarios conectados
function logConnectedUsers(prefix = 'Usuarios conectados') {
    console.log(`${prefix} (${connectedUsers.size}):`);
    Array.from(connectedUsers.entries()).forEach(([id, user]) => {
        console.log(`- ${user.name} (${id}): ${user.status}`);
    });
}

// Función para actualizar el estado de conexión en la base de datos
async function updateUserConnectionStatus(userId, status, socketId = null) {
    try {
        userId = normalizeUserId(userId);
        const userData = connectedUsers.get(userId) || {};
        
        const connectionData = {
            status,
            lastSeen: new Date(),
            socketId: socketId || userData.socketId
        };
        
        // Actualizar o crear registro de conexión
        await Connection.findOneAndUpdate(
            { userId },
            connectionData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        console.log(`Estado de conexión guardado en DB para ${userId}: ${status}`);
    } catch (error) {
        console.error('Error al guardar estado de conexión:', error);
    }
}

// Inicializar el mapa de usuarios conectados desde la base de datos
async function initializeConnectedUsers() {
    try {
        const connections = await Connection.find({ status: 'online' });
        
        connections.forEach(conn => {
            connectedUsers.set(normalizeUserId(conn.userId), {
                id: normalizeUserId(conn.userId),
                socketId: conn.socketId,
                name: conn.name,
                email: conn.email,
                status: conn.status
            });
        });
        
        console.log(`Inicializados ${connections.length} usuarios conectados desde la BD`);
    } catch (error) {
        console.error('Error al inicializar usuarios conectados:', error);
    }
}

// Inicializar conectados al arrancar el servidor
initializeConnectedUsers();

// Middleware de autenticación para Socket.IO
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return next(new Error('User not found'));
        }

        // Adjuntar usuario al socket con ID normalizado
        const userId = normalizeUserId(user._id);
        console.log(`Autenticando socket para usuario: ${user.name} (${userId})`);
        
        socket.user = {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        // Inicializar o actualizar el registro de conexión
        await Connection.findOneAndUpdate(
            { userId: userId },
            { 
                userId: userId,
                name: user.name,
                email: user.email,
                socketId: socket.id,
                // No cambiar el estado a online aquí, se hará cuando la conexión sea completa
            },
            { upsert: true, setDefaultsOnInsert: true }
        );
        
        next();
    } catch (error) {
        console.error('Error en autenticación Socket.IO:', error);
        next(new Error('Authentication error'));
    }
});

// Manejo de conexiones Socket.IO
io.on('connection', async (socket) => {
    console.log('Usuario conectado:', socket.user.name, 'ID:', socket.user.id);
    
    // Agregar usuario a la lista de conectados con estado explícito
    connectedUsers.set(socket.user.id, {
        id: socket.user.id,
        socketId: socket.id,
        name: socket.user.name,
        email: socket.user.email,
        status: 'online'
    });
    
    // Actualizar estado en la base de datos
    await updateUserConnectionStatus(socket.user.id, 'online', socket.id);
    
    // Log para depuración
    logConnectedUsers('Usuarios conectados tras conexión');

    // Obtener lista de usuarios disponibles para chat
    try {
        console.log('Buscando usuarios disponibles...');
        const users = await User.find()
            .select('_id name email role')
            .lean();
        
        // Obtener estados de conexión actualizados de la BD
        const connections = await Connection.find().lean();
        const connectionMap = new Map();
        connections.forEach(conn => {
            connectionMap.set(normalizeUserId(conn.userId), conn);
        });
        
        // Convertir ObjectIds a strings y agregar estado
        const usersWithStatus = users.map(user => {
            const userId = normalizeUserId(user._id);
            let status = 'offline';
            
            // Verificar primero en el mapa de conectados en memoria
            if (connectedUsers.has(userId)) {
                status = connectedUsers.get(userId).status;
            } 
            // Luego verificar en la BD
            else if (connectionMap.has(userId)) {
                const conn = connectionMap.get(userId);
                status = conn.status;
                
                // Si está online en la BD pero no en memoria, añadirlo a memoria
                if (status === 'online' && !connectedUsers.has(userId)) {
                    connectedUsers.set(userId, {
                        id: userId,
                        socketId: conn.socketId,
                        name: user.name,
                        email: user.email,
                        status: 'online'
                    });
                }
            }
            
            return {
                ...user,
                _id: userId,
                status: status
            };
        });
        
        console.log('Usuarios encontrados con estado:');
        usersWithStatus.forEach(user => {
            console.log(`- ${user.name} (${user._id}): ${user.status}`);
        });
        
        // Enviar lista de usuarios disponibles al cliente
        socket.emit('available_users', usersWithStatus);
        
        // Notificar a todos los usuarios sobre el nuevo usuario conectado
        console.log(`Notificando cambio de estado para ${socket.user.name} (${socket.user.id}): online`);
        io.emit('user_status_change', {
            userId: socket.user.id,
            status: 'online',
            name: socket.user.name
        });

        // Enviar lista actualizada de usuarios conectados a todos
        const connectedUsersList = Array.from(connectedUsers.values()).map(user => ({
            id: user.id,
            socketId: user.socketId,
            name: user.name,
            email: user.email,
            status: user.status
        }));
        
        io.emit('connected_users_update', connectedUsersList);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        socket.emit('error', 'Error al obtener la lista de usuarios');
    }

    // Manejar nuevos mensajes
    socket.on('send_message', async (data) => {
        const { chatId, message } = data;
        
        try {
            // Crear objeto de mensaje usando la información del usuario autenticado
            const messageObj = {
                chatId: chatId,
                sender: socket.user.id,
                senderName: socket.user.name,
                content: message,
                timestamp: new Date()
            };

            // Guardar mensaje en MongoDB
            const savedMessage = await Message.create(messageObj);
            console.log(`Mensaje guardado en DB: ${savedMessage._id}`);
            
            // Emitir mensaje a todos en la sala
            io.to(chatId).emit('new_message', {
                ...messageObj,
                id: savedMessage._id.toString()
            });
            
            // Notificar a los usuarios que no están en la sala
            const targetUserId = chatId.split('_').find(id => id !== socket.user.id);
            const targetSocket = connectedUsers.get(targetUserId);
            
            if (targetSocket) {
                io.to(targetSocket.socketId).emit('notification', {
                    type: 'new_message',
                    chatId,
                    message: `Nuevo mensaje de ${socket.user.name}`,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Error al guardar mensaje:', error);
            socket.emit('error', 'Error al enviar mensaje');
        }
    });

    // Manejar escritura
    socket.on('typing', (data) => {
        const { chatId, isTyping } = data;
        socket.to(chatId).emit('user_typing', {
            userId: socket.user.id,
            userName: socket.user.name,
            isTyping
        });
    });

    // Manejar inicio de chat privado
    socket.on('start_private_chat', async (targetUserId) => {
        try {
            const targetUser = await User.findById(targetUserId);
            if (!targetUser) {
                socket.emit('error', 'Usuario no encontrado');
                return;
            }

            // Crear ID único para la conversación privada
            const chatId = [socket.user.id, targetUserId].sort().join('_');
            
            // Unirse a la sala de chat privada
            socket.join(chatId);
            
            // Recuperar historial de mensajes de la base de datos
            const chatHistory = await Message.find({ chatId })
                .sort({ timestamp: 1 })
                .lean();
                
            console.log(`Recuperados ${chatHistory.length} mensajes para chat ${chatId}`);
            
            // Convertir ObjectIds a strings para enviar al cliente
            const formattedHistory = chatHistory.map(msg => ({
                ...msg,
                id: msg._id.toString(),
                sender: msg.sender.toString()
            }));
            
            // Enviar historial de mensajes
            socket.emit('chat_history', formattedHistory);

            // Notificar al otro usuario si está conectado
            const targetSocketInfo = connectedUsers.get(normalizeUserId(targetUserId));
            if (targetSocketInfo) {
                io.to(targetSocketInfo.socketId).emit('private_chat_started', {
                    chatId,
                    withUser: {
                        id: socket.user.id,
                        name: socket.user.name
                    }
                });
            }
        } catch (error) {
            console.error('Error al iniciar chat privado:', error);
            socket.emit('error', 'Error al iniciar chat privado');
        }
    });

    // Manejar desconexión con mejor manejo de estado
    socket.on('disconnect', async () => {
        if (!socket.user) {
            console.log('Socket desconectado sin usuario asociado');
            return;
        }
        
        console.log('Usuario desconectado:', socket.user.name, 'ID:', socket.user.id);
        
        // Actualizar estado del usuario a offline
        if (connectedUsers.has(socket.user.id)) {
            const userData = connectedUsers.get(socket.user.id);
            userData.status = 'offline';
            connectedUsers.set(socket.user.id, userData);
            
            // Actualizar estado en la base de datos
            await updateUserConnectionStatus(socket.user.id, 'offline');
            
            // Notificar a todos los usuarios sobre el cambio de estado
            console.log(`Notificando cambio de estado para ${socket.user.name} (${socket.user.id}): offline`);
            io.emit('user_status_change', {
                userId: socket.user.id,
                status: 'offline',
                name: socket.user.name
            });
            
            // Log para depuración
            console.log('Usuario marcado como offline:', socket.user.name);
            logConnectedUsers('Usuarios conectados tras desconexión');

            // Enviar lista actualizada de usuarios conectados
            const connectedUsersList = Array.from(connectedUsers.values());
            io.emit('connected_users_update', connectedUsersList);
            
            // Remover usuario de la lista de conectados después de un breve delay
            setTimeout(() => {
                if (!io.sockets.sockets.has(socket.id)) {
                    connectedUsers.delete(socket.user.id);
                    console.log('Usuario removido de la lista de conectados:', socket.user.name);
                    logConnectedUsers('Usuarios conectados tras limpieza');
                }
            }, 5000); // Esperar 5 segundos antes de remover completamente
        } else {
            console.log(`Usuario ${socket.user.name} no encontrado en la lista de conectados`);
        }
    });
});

app.use((err, req, res, next) => { // Basic error handling
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// START SERVER ON PORT 3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://${getLocalIP()}:${PORT}`);
});

// Función para obtener la IP local
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// ROUTE TO ADMIN DASHBOARD
app.get('/admin/dashboard', verifyToken, authorizeRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'interfaces/admin_dashboard.html'));
});

// Ruta de ping actualizada
app.get('/api/ping', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.json({ 
        message: 'Backend activated',
        timestamp: new Date().toISOString()
    });
    console.log('Ping received from:', req.headers.origin || req.ip);
});