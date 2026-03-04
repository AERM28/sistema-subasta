import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

class UserService {

    // Listar todos los usuarios
    // GET http://localhost:81/sistema-subasta/api/user
    getUsers() {
        return axios.get(BASE_URL);
    }

    // Obtener usuario por id
    // GET http://localhost:81/sistema-subasta/api/user/1
    getUserById(userId) {
        return axios.get(BASE_URL + '/' + userId);
    }

    // Obtener detalle completo del usuario (con conteos calculados e historial)
    // GET http://localhost:81/sistema-subasta/api/user/getUserDetail/1
    getUserDetail(userId) {
        return axios.get(BASE_URL + '/getUserDetail/' + userId);
    }

}

export default new UserService();