import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
    QrCode, Camera, CheckCircle2, XCircle, AlertTriangle, Loader2, ScanLine
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useFitMutation } from '../../hooks/useFitQuery';
import { useUI } from '../../context/UIContext';

const COOLDOWN_MS = 2500;       // мінімум між однаковими QR
const OVERLAY_MS = 1800;        // як довго світиться зелений/червоний оверлей

export default function QRScannerTab() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const lastScanRef = useRef({ payload: null, at: 0 });
    const { addToast } = useUI();

    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [overlay, setOverlay] = useState(null);    // { granted, reason, name } | null
    const [recent, setRecent] = useState([]);        // [{id, granted, name, reason, time}]
    const [isPaused, setIsPaused] = useState(false);

    const checkMutation = useFitMutation('POST');

    // ─────────────────────── Камера ───────────────────────
    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            setStream(s);
        } catch (e) {
            setCameraError(
                e.name === 'NotAllowedError'
                    ? 'Доступ до камери заборонено. Дозвольте у налаштуваннях браузера.'
                    : e.name === 'NotFoundError'
                        ? 'Камеру не знайдено. Підключіть камеру і перезавантажте сторінку.'
                        : 'Не вдалося отримати доступ до камери: ' + e.message
            );
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // ─────────────────────── Обробка результату ───────────────────────
    const showOverlay = useCallback((data) => {
        setOverlay(data);
        setTimeout(() => setOverlay(null), OVERLAY_MS);
    }, []);

    const addRecent = useCallback((item) => {
        setRecent(prev => [{ ...item, id: Date.now() }, ...prev].slice(0, 10));
    }, []);

    const handleQRPayload = useCallback((payload) => {
        // payload — JSON-рядок {member_id, gym_id} або сирий текст
        let parsed;
        try {
            parsed = JSON.parse(payload);
        } catch {
            showOverlay({ granted: false, reason: 'Невалідний QR-код' });
            addRecent({ granted: false, name: '—', reason: 'Невалідний QR', time: new Date() });
            return;
        }

        if (!parsed.member_id || !parsed.gym_id) {
            showOverlay({ granted: false, reason: 'У QR не вистачає member_id або gym_id' });
            addRecent({ granted: false, name: '—', reason: 'Неповний QR', time: new Date() });
            return;
        }

        checkMutation.mutate(
            {
                endpoint: '/api/access/check/',
                data: { member_id: parsed.member_id, gym_id: parsed.gym_id }
            },
            {
                onSuccess: (res) => {
                    showOverlay({
                        granted: res.granted,
                        reason: res.reason || (res.granted ? 'Доступ дозволено' : 'Відмова'),
                        member_id: parsed.member_id,
                    });
                    addRecent({
                        granted: res.granted,
                        name: `Клієнт #${parsed.member_id}`,
                        reason: res.reason || 'Доступ дозволено',
                        time: new Date(),
                    });
                },
                onError: (err) => {
                    // Сервер може відповісти 403 з тіла з reason
                    const reason = err?.response?.data?.reason
                        || err?.response?.data?.detail
                        || err.message
                        || 'Невідома помилка';
                    showOverlay({ granted: false, reason });
                    addRecent({
                        granted: false,
                        name: `Клієнт #${parsed.member_id}`,
                        reason,
                        time: new Date(),
                    });
                },
            }
        );
    }, [checkMutation, showOverlay, addRecent]);

    // ─────────────────────── Декодер на кожен кадр ───────────────────────
    useEffect(() => {
        if (!stream || isPaused) return;

        let cancelled = false;

        const tick = () => {
            if (cancelled) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code && code.data) {
                    const now = Date.now();
                    const last = lastScanRef.current;
                    if (code.data !== last.payload || (now - last.at) > COOLDOWN_MS) {
                        lastScanRef.current = { payload: code.data, at: now };
                        handleQRPayload(code.data);
                    }
                }
            }
            animationRef.current = requestAnimationFrame(tick);
        };

        animationRef.current = requestAnimationFrame(tick);
        return () => {
            cancelled = true;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [stream, isPaused, handleQRPayload]);

    // ─────────────────────── UI ───────────────────────
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-[#141414] to-transparent p-6 rounded-2xl border-l-4 border-primary">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-wider text-[#ffffff] m-0">QR Сканер</h2>
                    <p className="text-[#aaaaaa] text-sm mt-1 font-semibold">
                        Скануйте QR-перепустку клієнта з камери. Відмови та доступи фіксуються у Журналі.
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-lg font-black uppercase tracking-wider text-sm border border-primary/20">
                    {stream ? (
                        <><ScanLine className="w-4 h-4 animate-pulse" /> Сканую</>
                    ) : (
                        <><Camera className="w-4 h-4" /> Камера вимкнена</>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                {/* Camera viewport */}
                <GlassCard className="p-0 overflow-hidden relative">
                    <div className="relative w-full" style={{ aspectRatio: '16/10', background: '#000' }}>
                        {cameraError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8 text-[#aaa]">
                                <AlertTriangle className="w-10 h-10 text-yellow-500" />
                                <p className="font-bold">{cameraError}</p>
                                <button
                                    onClick={startCamera}
                                    className="mt-2 px-4 py-2 bg-primary text-white font-black uppercase text-xs rounded-lg tracking-wider hover:bg-primary/80"
                                >
                                    Спробувати ще раз
                                </button>
                            </div>
                        ) : !stream ? (
                            <div className="absolute inset-0 flex items-center justify-center text-[#888]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Scan frame */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-2/3 aspect-square border-2 border-primary/60 rounded-2xl">
                                        {/* Corner accents */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                                        {/* Scan line animation */}
                                        <div className="absolute inset-x-4 top-1/2 h-0.5 bg-primary shadow-[0_0_15px_#cc0000] animate-pulse" />
                                    </div>
                                </div>

                                {/* Result overlay */}
                                {overlay && (
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm transition-all ${
                                        overlay.granted
                                            ? 'bg-green-500/30 border-4 border-green-500'
                                            : 'bg-red-500/30 border-4 border-red-500'
                                    }`}>
                                        {overlay.granted ? (
                                            <CheckCircle2 className="w-24 h-24 text-green-400 drop-shadow-[0_0_20px_#10b981]" />
                                        ) : (
                                            <XCircle className="w-24 h-24 text-red-400 drop-shadow-[0_0_20px_#ef4444]" />
                                        )}
                                        <h3 className="text-3xl font-black uppercase tracking-wider text-white mt-4 drop-shadow-lg">
                                            {overlay.granted ? 'Доступ дозволено' : 'Відмова'}
                                        </h3>
                                        <p className="text-white/90 font-bold text-lg mt-2 px-8 text-center">
                                            {overlay.reason}
                                        </p>
                                    </div>
                                )}

                                {/* Pause/resume button */}
                                <button
                                    onClick={() => setIsPaused(p => !p)}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md text-white font-black uppercase text-xs rounded-lg tracking-wider border border-white/20 hover:bg-black/80"
                                >
                                    {isPaused ? '▶ Продовжити' : '⏸ Пауза'}
                                </button>
                            </>
                        )}
                    </div>
                </GlassCard>

                {/* Recent scans */}
                <GlassCard className="p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <ScanLine className="w-5 h-5 text-primary" />
                        <h3 className="text-sm text-white font-black uppercase tracking-wider">Останні сканування</h3>
                    </div>

                    {recent.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-[#666] text-sm font-semibold py-8">
                            Скануйте QR — результати з'являться тут
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar" style={{maxHeight: '450px'}}>
                            {recent.map(item => (
                                <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                                    item.granted
                                        ? 'bg-green-500/5 border-green-500/30'
                                        : 'bg-red-500/5 border-red-500/30'
                                }`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        item.granted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {item.granted ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="m-0 text-xs font-black text-white truncate">{item.name}</p>
                                        <p className="m-0 text-[11px] text-[#aaa] font-bold mt-0.5 truncate">{item.reason}</p>
                                        <span className="text-[10px] text-[#666] font-bold mt-0.5 block">
                                            {item.time.toLocaleTimeString('uk-UA')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                @keyframes scan-line {
                    0%, 100% { transform: translateY(-50%); opacity: 0.4; }
                    50% { transform: translateY(50%); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
