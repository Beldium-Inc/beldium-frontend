import { fetchTest } from "@/src/services/test.services"
import { useQuery } from "@tanstack/react-query"

export const useTests = ()=> {
    return useQuery({
        queryKey: ['tests'],
        queryFn: fetchTest
    })
}