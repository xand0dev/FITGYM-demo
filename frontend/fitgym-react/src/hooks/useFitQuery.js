import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicRequest, authRequest } from '../utils/api';

// 1. УНІВЕРСАЛЬНИЙ РАДАР (Отримання даних)
// Використання: const { data: trainers, isLoading } = usePublicData('trainers', '/api/instructors/');
export const usePublicData = (key, endpoint) => {
    return useQuery({
        queryKey: [key],
        queryFn: () => publicRequest(endpoint),
    });
};

export const useAuthData = (key, endpoint) => {
    return useQuery({
        queryKey: [key],
        queryFn: () => authRequest(endpoint),
    });
};

// 2. УНІВЕРСАЛЬНА АРТИЛЕРІЯ (Відправка/Зміна даних)
// Автоматично скидає кеш, щоб UI миттєво оновився після дії
export const useFitMutation = (method = 'POST') => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ endpoint, data }) => authRequest(endpoint, method, data),
        onSuccess: () => {
            // Примушуємо всі дані оновитися після успішного удару (створення/видалення)
            queryClient.invalidateQueries();
        }
    });
};