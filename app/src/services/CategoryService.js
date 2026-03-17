import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + 'category';

const CategoryService = {
    getAll() {
        return axios.get(BASE_URL);
    },
    getById(id) {
        return axios.get(BASE_URL + "/" + id);
    }
};

export default CategoryService;