import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="not-found-root">
            <div className="noise-bg"></div>
            
            <div className="not-found-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-title">Сторінку не знайдено</h2>
                <p className="error-text">
                    Схоже, ви перейшли за неіснуючим посиланням. Ця сторінка була видалена, переміщена, або її ніколи не існувало.
                </p>
                <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '15px 30px', fontSize: '1.1rem', borderRadius: '8px' }}>
                    <i className="fas fa-home" style={{marginRight: '10px'}}></i> На головну
                </Link>
            </div>

            <style>{`
                .not-found-root {
                    /* Жорстке перекриття всього екрану, щоб прибрати білі смуги */
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #080808;
                    color: #fff;
                    overflow: hidden;
                    text-align: center;
                    padding: 20px;
                    z-index: 9999;
                }
                .noise-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E');
                    pointer-events: none;
                    z-index: 1;
                }
                .not-found-content {
                    position: relative;
                    z-index: 2;
                    max-width: 600px;
                }
                .error-code {
                    font-size: clamp(6rem, 15vw, 12rem);
                    font-weight: 900;
                    color: transparent;
                    -webkit-text-stroke: 4px #e60000;
                    margin: 0;
                    line-height: 1;
                    letter-spacing: -5px;
                    text-shadow: 0 0 40px rgba(230,0,0,0.4);
                    animation: pulse-glow 3s infinite alternate;
                }
                @keyframes pulse-glow {
                    0% { text-shadow: 0 0 20px rgba(230,0,0,0.2); }
                    100% { text-shadow: 0 0 60px rgba(230,0,0,0.6); }
                }
                .error-title {
                    font-size: 2rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    margin: 20px 0;
                    letter-spacing: 2px;
                }
                .error-text {
                    color: #888;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 40px;
                }
            `}</style>
        </div>
    );
}