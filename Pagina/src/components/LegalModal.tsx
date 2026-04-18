import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, ShieldCheck, Cookie, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string | null;
}

const contentMap: Record<string, { title: string; icon: React.ReactNode; body: React.ReactNode }> = {
  Privacidad: {
    title: 'Política de Privacidad Integral',
    icon: <Lock className="w-6 h-6 text-sky-400" />,
    body: (
      <div className="space-y-4 text-slate-300">
        <p><strong>Última actualización:</strong> Abril 2026</p>
        <p>En SkyTech Global, con domicilio principal en Santo Domingo, Distrito Nacional, República Dominicana, respetamos profundamente su privacidad. Esta Política de Privacidad describe exhaustivamente cómo recopilamos, utilizamos, procesamos, compartimos y protegemos su información personal, en estricto cumplimiento con la <strong>Ley No. 172-13 sobre Protección de Datos Personales</strong> de la República Dominicana, así como con estándares internacionales aplicables.</p>
        
        <h3 className="text-white font-bold mt-6">1. Recopilación y Tipos de Datos</h3>
        <p>Al interactuar con nuestros servicios de TI y telecomunicaciones, recopilamos información personal necesaria para la prestación del servicio. Esto incluye: datos de identificación (RNC, nombre, cédula), datos de contacto, datos de ubicación (direcciones IP) e información técnica. La recopilación se realiza bajo el principio de licitud y lealtad requerido por la jurisdicción local (Art. 5, Ley 172-13).</p>
        
        <h3 className="text-white font-bold mt-6">2. Base Legal y Tratamiento Local</h3>
        <p>El tratamiento de sus datos personales se fundamenta en su consentimiento explícito y en la ejecución de contratos mercantiles. Sus datos se procesan internamente con algoritmos de cifrado de estado militar (AES-256) garantizando total confidencialidad e integridad del dato. Cumplimos con los requisitos del Habeas Data, permitiéndole conocer qué información tenemos registrada en nuestras bases de datos en territorio dominicano.</p>

        <h3 className="text-white font-bold mt-6">3. Derechos ARCO (República Dominicana)</h3>
        <p>Bajo el marco jurídico dominicano, usted tiene garantizados irrenunciablemente los derechos <strong>ARCO</strong>:</p>
        <ul className="list-disc pl-5 space-y-2 mt-4 text-sm bg-slate-900 border border-slate-700 p-4 rounded-xl">
          <li><strong>Acceso:</strong> Derecho a solicitar las informaciones sobre usted en nuestros registros públicos o privados.</li>
          <li><strong>Rectificación:</strong> Modificar los datos que sean inexactos o incompletos.</li>
          <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios para los fines consentidos.</li>
          <li><strong>Oposición:</strong> Negarse al tratamiento de sus datos personales bajo circunstancias legítimas.</li>
        </ul>
        
        <h3 className="text-white font-bold mt-6">4. Autoridad de Control</h3>
        <p>En caso de controversias, el usuario tiene derecho a presentar una reclamación o recurso de amparo ante las autoridades jurisdiccionales competentes en la República Dominicana (Cámara Civil y Comercial del Juzgado de Primera Instancia) para la tutela de sus derechos de Habeas Data.</p>
      </div>
    ),
  },
  Términos: {
    title: 'Términos de Servicio y Contrato',
    icon: <FileText className="w-6 h-6 text-sky-400" />,
    body: (
      <div className="space-y-4 text-slate-300">
        <p><strong>Efectivo desde:</strong> Enero 2026</p>
        <p>Estos Términos y Condiciones constituyen un contrato legal y vinculante entre usted (el "Cliente") y SkyTech Global. Al acceder, navegar o utilizar infraestructuras y servicios de SkyTech, el usuario confirma que ha leído, entendido y acepta someterse al cumplimiento de estos términos, así como a todas las leyes y regulaciones aplicables en la <strong>República Dominicana</strong>.</p>
        
        <h3 className="text-white font-bold mt-6">1. Regulaciones del Servicio (INDOTEL)</h3>
        <p>Nuestros servicios de telecomunicaciones operan bajo la supervisión y normativas del <strong>Instituto Dominicano de las Telecomunicaciones (INDOTEL)</strong> regulado por la Ley General de Telecomunicaciones No. 153-98. Nos comprometemos a mantener un nivel de calidad de servicio (SLA) estable bajo los parámetros de conexión, velocidad y latencia estipulados en territorio dominicano.</p>

        <h3 className="text-white font-bold mt-6">2. Uso Inadecuado y Delitos Cibernéticos</h3>
        <p>El Cliente acepta utilizar las redes de SkyTech de forma lícita y adecuada. Queda expresamente prohibido el uso de la infraestructura para la creación, envío o alojamiento de contenido malicioso. Toda acción que vulnere nuestra infraestructura se someterá a la jurisdicción de la <strong>Ley No. 53-07 sobre Crímenes y Delitos de Alta Tecnología de la República Dominicana</strong>. Cualquier intento de fraude electrónico, robo de identidad o daño a las bases de datos será inmediatamente reportado a los organismos correspondientes.</p>
        
        <h3 className="text-white font-bold mt-6">3. Jurisdicción y Ley Aplicable</h3>
        <p>Cualquier disputa, controversia o reclamo que surja de este acuerdo o de su incumplimiento, resolución o invalidez, se regirá por las leyes vigentes en la República Dominicana. Las partes acuerdan someterse a la jurisdicción exclusiva de los tribunales del <strong>Distrito Nacional, República Dominicana</strong> domiciliados en Santo Domingo.</p>
      </div>
    ),
  },
  Cookies: {
    title: 'Acuerdo Técnico de Cookies',
    icon: <Cookie className="w-6 h-6 text-sky-400" />,
    body: (
      <div className="space-y-4 text-slate-300">
        <p>Este sitio web utiliza tecnologías de seguimiento web, comúnmente conocidas como <strong>cookies</strong>, para optimizar la experiencia de navegación de los usuarios, mejorar el rendimiento técnico del portal y asegurar el acceso ininterrumpido a módulos vitales como el "Centro de Comando" y el "Asistente Virtual con IA".</p>
        
        <h3 className="text-white font-bold mt-6">Tipología Exclusiva de Uso</h3>
        <p>En el panorama regulatorio actual dominicano e internacional, clasificamos nuestras cookies procesadas de la siguiente manera:</p>
        <div className="mt-4 space-y-4 text-sm">
          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-lg">
            <h4 className="text-white font-bold mb-1">🍪 Cookies Estrictamente Necesarias (Esenciales)</h4>
            <p>Son protocolos sin los cuales la infraestructura web no podría operar. Permiten la autenticación asimétrica del usuario en conexiones seguras (HTTPS), guardan las preferencias locales (como el modo oscuro/claro) de manera que no estemos obligando al usuario a elegir su tema en cada recarga de página. Estas no requieren consentimiento bajo la norma general debido a su naturaleza pasiva.</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-lg">
            <h4 className="text-white font-bold mb-1">🍪 Cookies de Analítica (Performance)</h4>
            <p>Usamos rastreadores anónimos de primera y tercera parte para medir los niveles de tráfico transaccional y la tasa de interacción. Nos ayudan a saber si usted visitó la página de *Servicios* o se quedó en *Inicio*, para poder ofrecer infraestructuras tecnológicas y promociones comerciales adaptadas al mercado en la República Dominicana.</p>
          </div>
        </div>
        
        <p className="mt-6 text-sm italic text-slate-500 border-l border-slate-700 pl-4">El usuario retiene total control. Puede bloquear sistemáticamente la escritura de cookies configurando las reglas estrictas de procesamiento desde su navegador web preferido en cualquier momento.</p>
      </div>
    ),
  },
  Seguridad: {
    title: 'Protocolos de Seguridad de Red',
    icon: <ShieldCheck className="w-6 h-6 text-sky-400" />,
    body: (
      <div className="space-y-4 text-slate-300">
        <p>La ciberseguridad no es un complemento, es nuestra base. Operamos bajo el marco <strong>Zero Trust (Confianza Cero)</strong> para garantizar que su flujo de información dentro y fuera de la República Dominicana esté permanentemente fortificado contra intrusiones sofisticadas.</p>
        
        <h3 className="text-white font-bold mt-6">Garantías bajo la Ley 53-07</h3>
        <p>Trabajamos activamente en concordancia preventiva con las estipulaciones de la <strong>Ley 53-07 dominicana</strong> para aislar comportamientos y extorsiones cibernéticas. Colaboramos estrechamente ante mandatos judiciales con el <strong>DICAT</strong> (Departamento de Investigación de Crímenes y Delitos de Alta Tecnología) previniendo activamente el uso de nuestros recursos interconectados para actividades que comprometan la seguridad de la nación o de nuestros clientes comerciales transnacionales.</p>
        
        <h3 className="text-white font-bold mt-6">Arquitectura Defensiva</h3>
        <p>Nuestras defensas tácticas despliegan múltiples capas inquebrantables de validación:</p>
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mt-6">
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
              <div>
                <strong className="text-white">Criptografía E2E de Extremo a Extremo:</strong> Túneles de comunicación basados en TLS 1.3 que aseguran privacidad máxima y rechazo incondicional de los ataques de Intermediario (Man-in-the-middle).
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
              <div>
                <strong className="text-white">Mitigación DDoS L7 Perimetral:</strong> Disipación cinética de ataques distribuidos de denegación de servicio que apuntan a la capa de aplicación sin causar latencia de origen.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> 
              <div>
                <strong className="text-white">Inteligencia Artificial Detectora (SIEM):</strong> Un motor unificado entrenado para detectar anomalías logísticas en el ecosistema 24/7/365 en tiempos de respuesta fraccionados por microsegundos.
              </div>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
};

// Helper microcomponent for icon
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  useEffect(() => {
    // Prevent scrolling on html body when modal opens
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const EscapableClose = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', EscapableClose);
    return () => document.removeEventListener('keydown', EscapableClose);
  }, []);

  const content = type ? contentMap[type] : null;

  return (
    <AnimatePresence>
      {isOpen && content && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[120] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    {content.icon}
                  </div>
                  <h2 className="text-xl font-bold tracking-widest text-white uppercase">{content.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {content.body}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
