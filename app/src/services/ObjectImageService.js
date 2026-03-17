import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "objectImage";

const ObjectImageService = {
    upload(formData) {
        return axios.post(BASE_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export default ObjectImageService;