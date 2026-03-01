import { useAuthData, useFitMutation } from '../../hooks/useFitQuery'; 
import { useQueryClient } from '@tanstack/react-query';
import { useUI } from '../../context/UIContext';

export default function MyBookings() {
    const { addToast, confirmAction } = useUI();
    const queryClient = useQueryClient();
    
    const { data: bookings = [], isLoading: isBookingsLoading } = useAuthData('my-bookings', '/api/my-bookings/');
    const cancelMutation = useFitMutation('DELETE');

    const handleCancelBooking = (bookingId) => {
        confirmAction(
            "Ви впевнені, що хочете скасувати цей запис на тренування?",
            () => {
                cancelMutation.mutate(
                    { endpoint: `/api/my-bookings/${bookingId}/` },
                    {
                        onSuccess: () => {
                            addToast('Запис успішно скасовано!', 'success');
                            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
                        },
                        onError: (error) => addToast(error.message || 'Помилка', 'error')
                    }
                );
            }
        );
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'booked': return 'ЗАПЛАНОВАНО';
            case 'attended': return 'ВІДВІДАНО';
            case 'missed': return 'ПРОПУЩЕНО';
            case 'cancelled': return 'СКАСОВАНО';
            default: return status.toUpperCase();
        }
    };

    return (
        <div className="p-[20px] sm:p-[30px] rounded-[24px] border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 mb-[30px] bg-[var(--c-card)]" data-aos="fade-up">
            <h4 className="text-primary font-black tracking-[1px] mb-[20px]">МОЇ ТРЕНУВАННЯ</h4>
            <div className="flex flex-col gap-[15px]">
                {isBookingsLoading ? (
                    <>
                        <div className="h-[70px] rounded-xl animate-pulse bg-[var(--c-input)]"></div>
                        <div className="h-[70px] rounded-xl animate-pulse bg-[var(--c-input)]"></div>
                    </>
                ) : bookings.length === 0 ? (
                    <div className="p-[20px] rounded-xl border border-dashed border-[var(--c-border)] text-center opacity-60 bg-[var(--c-input)]">
                        Ви ще не записані на жодне тренування. Перейдіть до Розкладу.
                    </div>
                ) : (
                    bookings.map(b => (
                        <div key={b.id} className={`p-[15px_20px] rounded-xl border-l-[4px] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-colors duration-300 bg-[var(--c-input)] ${b.status === 'cancelled' ? 'border-l-[#888]' : 'border-l-primary'}`}>
                            <div>
                                <strong className="block text-[1.1rem]">{b.session?.class_name || 'Групове заняття'}</strong>
                                <span className="text-[0.85rem] text-[#888]">{new Date(b.session?.start_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-[15px] w-full sm:w-auto border-t border-[#88888820] sm:border-none pt-2 sm:pt-0 mt-2 sm:mt-0">
                                <div className={`font-black text-[0.8rem] tracking-[1px] ${b.status === 'cancelled' ? 'text-[#888]' : 'text-primary'}`}>
                                    {getStatusLabel(b.status)}
                                </div>
                                {b.status === 'booked' && (
                                    <button 
                                        onClick={() => handleCancelBooking(b.id)}
                                        disabled={cancelMutation.isPending}
                                        className="w-[30px] h-[30px] flex items-center justify-center text-[1.2rem] text-[#888] rounded-full hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
                                    >×</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}