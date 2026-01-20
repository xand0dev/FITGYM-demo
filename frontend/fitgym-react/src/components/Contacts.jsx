// src/components/Contacts.jsx
export default function Contacts() {
    return (
        <section id="contacts" className="section container">
            <h2>Контакти та розташування</h2>
            <p><b>Телефон:</b> +38 (097) 123-45-67</p>
            <p><b>Email:</b> info@fitgym.ua</p>
            <p><b>Адреса:</b> вул. Вінницька, 42а, м. Бердичів</p>

            <div className="map-wrap" style={{marginTop: '20px'}}>
                <iframe 
                    loading="lazy" 
                    title="Мапа"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2576.6!2d28.0!3d49.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDUzJzU1LjAiTiAyOMKwMzUnNDAuMCJF!5e0!3m2!1suk!2sua!4v1600000000000!5m2!1suk!2sua"
                    className="map-iframe" 
                    allowFullScreen=""
                    style={{width: '100%', height: '400px', border: 0}}
                ></iframe>
            </div>
        </section>
    );
}