import { useAuthData, useFitMutation } from '../../hooks/useFitQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useUI } from '../../context/UIContext';
import { CalendarDays, Clock, MapPin, User, Dumbbell } from "lucide-react";

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
        switch (status) {
            case 'booked': return 'Підтверджено';
            case 'attended': return 'Відвідано';
            case 'missed': return 'Пропущено';
            case 'cancelled': return 'Скасовано';
            default: return status;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-[var(--c-text)]">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
                    <CalendarDays className="w-8 h-8 text-primary" />
                    Мої <span className="text-primary">Бронювання</span>
                </h2>
                <p className="text-[#888] text-sm mt-1 font-bold">
                    Ваші заплановані заняття та бронювання
                </p>
            </div>

            <div className="space-y-3">
                {isBookingsLoading ? (
                    <>
                        <div className="h-[70px] rounded-xl animate-pulse bg-[var(--c-input)]"></div>
                        <div className="h-[70px] rounded-xl animate-pulse bg-[var(--c-input)]"></div>
                    </>
                ) : bookings.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-[var(--c-border)] text-center text-[#888] font-bold bg-[var(--c-input)]">
                        Ви ще не записані на жодне тренування. Перейдіть до Розкладу.
                    </div>
                ) : (
                    bookings.map((b) => {
                        const isCancelled = b.status === "cancelled";
                        const isBooked = b.status === "booked";

                        return (
                            <div key={b.id} className={`p-4 rounded-xl border border-[var(--c-border)] flex flex-col sm:flex-row sm:items-center gap-4 transition-transform hover:-translate-y-1 duration-300 bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] ${isCancelled ? 'opacity-60' : ''}`}>
                                <div className={`w-12 h-12 rounded-lg ${isCancelled ? 'bg-[var(--c-input)]' : 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
                                    <Dumbbell className={`w-6 h-6 ${isCancelled ? 'text-[#888]' : 'text-primary'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black">{b.session?.class_name || 'Групове заняття'}</p>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        {/* Since we don't have instructor/room in standard model yet, we show placeholders if missing */}
                                        <span className="text-xs text-[#888] flex items-center gap-1 font-bold">
                                            <User className="w-3 h-3" /> Тренер
                                        </span>
                                        <span className="text-xs text-[#888] flex items-center gap-1 font-bold">
                                            <MapPin className="w-3 h-3" /> Зал
                                        </span>
                                        <span className="text-xs text-[#888] flex items-center gap-1 font-bold">
                                            <Clock className="w-3 h-3" /> {new Date(b.session?.start_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-3 sm:mt-0 justify-between sm:justify-end">
                                    <span className={`text-[0.7rem] font-black uppercase tracking-wider px-3 py-1 rounded-full ${isBooked
                                            ? "bg-green-500/10 text-green-500"
                                            : isCancelled ? "bg-[#888]/10 text-[#888]" : "bg-primary/10 text-primary"
                                        }`}>
                                        {getStatusLabel(b.status)}
                                    </span>

                                    {isBooked && (
                                        <button
                                            onClick={() => handleCancelBooking(b.id)}
                                            disabled={cancelMutation.isPending}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--c-input)] border border-[var(--c-border)] text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                                            title="Скасувати"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}