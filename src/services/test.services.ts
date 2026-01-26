import { publicApi } from "@/src/lib/axiosInstance"

export const fetchTest = async () => {
    const {data} = await publicApi.get("https://jsonplaceholder.typicode.com/posts")
    return data;
}